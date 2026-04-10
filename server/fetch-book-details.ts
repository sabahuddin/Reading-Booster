import pg from "pg";
import { sql } from "drizzle-orm";
import { db } from "./db";

const MIN_DESC_LENGTH = 30;
const MAX_PRODUCT_PAGES = 2;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "+");
}

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]/g, "");
}

function similarity(a: string, b: string): number {
  const na = normalizeStr(a);
  const nb = normalizeStr(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const matching = wordsA.filter(w => wordsB.some(wb => normalizeStr(wb).includes(normalizeStr(w)) || normalizeStr(w).includes(normalizeStr(wb))));
  return matching.length / Math.max(wordsA.length, wordsB.length);
}

async function fetchHtml(url: string, timeoutMs = 8000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseTableField(html: string, ...labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(`<th[^>]*>[^<]*${label}[^<]*<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "gi");
    const m = re.exec(html);
    if (m) {
      const val = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (val) return val;
    }
  }
  return null;
}

function parseDescription(html: string): string | null {
  const stdMatches = [...html.matchAll(/class="[^"]*\bstd\b[^"]*"[^>]*>([\s\S]{30,3000}?)<\/div>/gi)];
  for (const m of stdMatches) {
    const text = m[1]
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length >= MIN_DESC_LENGTH && !text.startsWith("Izdavač") && !text.startsWith("ISBN") && !/^\d/.test(text)) {
      return text.substring(0, 2000);
    }
  }
  const pdMatch = html.match(/id="tab-description"[^>]*>([\s\S]{30,3000}?)<\/div>/i);
  if (pdMatch) {
    const text = pdMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length >= MIN_DESC_LENGTH) return text.substring(0, 2000);
  }
  return null;
}

async function getDetailsFromPage(url: string, bookTitle: string) {
  const html = await fetchHtml(url);
  if (!html) return null;

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const pageTitle = h1Match ? h1Match[1].trim() : "";
  const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleTag = titleTagMatch ? titleTagMatch[1].replace(/\s*[-|].*knjiga\.ba.*/i, "").trim() : "";
  const sim = Math.max(similarity(bookTitle, pageTitle), similarity(bookTitle, titleTag));
  if (sim < 0.4) return null;

  const description = parseDescription(html);
  const publisher = parseTableField(html, "Izdava[čc]", "Publisher");
  const yearRaw = parseTableField(html, "Godina", "Year");
  let year: number | null = null;
  if (yearRaw) {
    const ym = yearRaw.match(/\b(19|20)\d{2}\b/);
    if (ym) year = parseInt(ym[0]);
  }
  const pagesRaw = parseTableField(html, "Broj stranica", "Stranica", "Pages");
  let pageCount: number | null = null;
  if (pagesRaw) {
    const pm = pagesRaw.match(/\b(\d{1,4})\b/);
    if (pm) pageCount = parseInt(pm[1]);
  }
  let city: string | null = null;
  if (publisher) {
    const cm = publisher.match(/\b(Sarajevo|Tuzla|Mostar|Banja\s*Luka|Zenica|Bihać|Trebinje|Beograd|Zagreb|Ljubljana)\b/i);
    if (cm) city = cm[1];
  }
  return { description, publisher, year, pageCount, city };
}

async function findLinks(title: string, author: string): Promise<string[]> {
  let query = slugify(title);
  if (query.length < 5 && author && author !== "Grupa autora") {
    const authorSlug = slugify(author.split(" ")[0]);
    query = `${query}+${authorSlug}`;
  }
  const html = await fetchHtml(`https://www.knjiga.ba/catalogsearch/result/?q=${query}`, 10000);
  if (!html) return [];
  const productLinks = [...html.matchAll(/class="product-name"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g)]
    .map(m => m[1]).filter((l: string) => l.includes("knjiga.ba"));
  return [...new Set(productLinks)].slice(0, MAX_PRODUCT_PAGES);
}

export type BookDetailStatus = {
  running: boolean;
  total: number;
  processed: number;
  updated: number;
  notFound: number;
  done: boolean;
  logs: string[];
};

export function createBookDetailStatus(): BookDetailStatus {
  return { running: false, total: 0, processed: 0, updated: 0, notFound: 0, done: false, logs: [] };
}

export async function fetchMissingBookDetails(
  status: BookDetailStatus,
  onProgress?: (msg: string) => void
): Promise<void> {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const { rows: booksToProcess } = await client.query(`
      SELECT id, title, author, description, publisher, publication_year, page_count, publication_city
      FROM books
      WHERE description IS NULL OR description = '' OR length(description) < ${MIN_DESC_LENGTH}
      ORDER BY title
    `);

    status.total = booksToProcess.length;
    status.processed = 0;
    status.updated = 0;
    status.notFound = 0;

    if (onProgress) onProgress(`Pronađeno ${booksToProcess.length} knjiga bez opisa.`);

    for (const book of booksToProcess) {
      const prefix = `[${status.processed + 1}/${status.total}]`;

      try {
        let resultLabel = "";

        await Promise.race([
          (async () => {
            const links = await findLinks(book.title, book.author);
            if (links.length === 0) {
              resultLabel = "✗ nije pronađen";
              status.notFound++;
              return;
            }

            for (const link of links) {
              const details = await getDetailsFromPage(link, book.title);
              if (!details) continue;

              const fields: string[] = [];
              const values: any[] = [book.id];

              if (details.description && details.description.length >= MIN_DESC_LENGTH && (!book.description || book.description.length < MIN_DESC_LENGTH)) {
                fields.push(`description = $${values.length + 1}`); values.push(details.description);
              }
              if (details.publisher && (!book.publisher || book.publisher.trim() === "")) {
                fields.push(`publisher = $${values.length + 1}`); values.push(details.publisher);
              }
              if (details.year && details.year >= 1900 && details.year <= 2026 && !book.publication_year) {
                fields.push(`publication_year = $${values.length + 1}`); values.push(details.year);
              }
              if (details.pageCount && details.pageCount > 0 && !book.page_count) {
                fields.push(`page_count = $${values.length + 1}`); values.push(details.pageCount);
              }
              if (details.city && !book.publication_city) {
                fields.push(`publication_city = $${values.length + 1}`); values.push(details.city);
              }

              if (fields.length > 0) {
                await client.query(`UPDATE books SET ${fields.join(", ")} WHERE id = $1`, values);
                resultLabel = `✓ ${fields.map(f => f.split(" ")[0]).join(", ")}`;
                status.updated++;
                return;
              }
            }
            resultLabel = "- pronađen, bez novih podataka";
          })(),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("timeout")), 30000)),
        ]).catch(() => {
          resultLabel = "! timeout";
          status.notFound++;
        });

        const msg = `${prefix} ${book.title} → ${resultLabel}`;
        if (onProgress) onProgress(msg);
      } catch {
        status.notFound++;
      }

      status.processed++;
      await new Promise(r => setTimeout(r, 600));
    }
  } finally {
    client.release();
    await pool.end();
  }

  status.done = true;
  status.running = false;
  if (onProgress) onProgress(`Završeno: ${status.updated} ažurirano od ${status.total} knjiga.`);
}

export async function countBooksNeedingDetails(): Promise<number> {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows } = await pool.query(`
      SELECT COUNT(*) as cnt FROM books
      WHERE description IS NULL OR description = '' OR length(description) < ${MIN_DESC_LENGTH}
    `);
    return parseInt(rows[0].cnt, 10);
  } finally {
    await pool.end();
  }
}
