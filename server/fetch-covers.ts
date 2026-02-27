import { db } from "./db";
import { books } from "../shared/schema";
import { eq } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "+");
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function similarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;

  const wordsA = a.toLowerCase().replace(/[^a-zčćšžđ0-9 ]/g, "").split(/\s+/).filter(w => w.length > 2);
  const wordsB = b.toLowerCase().replace(/[^a-zčćšžđ0-9 ]/g, "").split(/\s+/).filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const matching = wordsA.filter(w => wordsB.some(wb => wb.includes(w) || w.includes(wb)));
  return matching.length / Math.max(wordsA.length, wordsB.length);
}

export type CoverCandidate = {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  foundTitle: string;
  imageUrl: string;
  confidence: "exact" | "similar";
  similarityScore: number;
};

async function searchKnjigaBaCandidates(title: string, author: string): Promise<Array<{ foundTitle: string; imageUrl: string; similarity: number }>> {
  const candidates: Array<{ foundTitle: string; imageUrl: string; similarity: number }> = [];
  try {
    const query = slugify(title);
    const url = `https://www.knjiga.ba/catalogsearch/result/?q=${query}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return candidates;
    const html = await res.text();

    const productLinks = [...html.matchAll(/href="(https:\/\/www\.knjiga\.ba\/[^"]*\.html)"/g)]
      .map(m => m[1])
      .filter(l => !l.includes("catalogsearch") && !l.includes("customer"));

    const uniqueLinks = [...new Set(productLinks)];

    for (const link of uniqueLinks.slice(0, 5)) {
      try {
        const pRes = await fetchWithTimeout(link);
        if (!pRes.ok) continue;
        const pHtml = await pRes.text();

        const pageTitleMatch = pHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
        const rawPageTitle = pageTitleMatch ? pageTitleMatch[1].replace(/\s*[-|].*knjiga\.ba.*/i, "").trim() : "";

        const h1Match = pHtml.match(/<h1[^>]*>([^<]*)<\/h1>/i);
        const productName = h1Match ? h1Match[1].trim() : rawPageTitle;

        const sim = Math.max(similarity(title, productName), similarity(title, rawPageTitle));

        if (sim >= 0.3) {
          const allImgs = [...pHtml.matchAll(/src="(https:\/\/www\.knjiga\.ba\/media\/catalog\/product[^"]+\.(jpg|jpeg|png|webp))"/gi)]
            .map(m => m[1]);
          if (allImgs.length > 0) {
            const direct = allImgs[0].replace(/\/cache\/1\/[^/]+\/[^/]+\/[^/]+\//g, "/");
            candidates.push({ foundTitle: productName || rawPageTitle, imageUrl: direct, similarity: sim });
          }
        }
      } catch { continue; }
    }

    const searchImgs = [...html.matchAll(/src="(https:\/\/www\.knjiga\.ba\/media\/catalog\/product\/cache\/1\/small_image\/120x\/[^"]+)"/g)]
      .map(m => m[1]);
    const titleTokens = [...html.matchAll(/<h2[^>]*class="product-name"[^>]*>.*?<a[^>]*>([^<]*)<\/a>/gs)]
      .map(m => m[1].trim());

    for (let i = 0; i < titleTokens.length && i < searchImgs.length; i++) {
      const sim = similarity(title, titleTokens[i]);
      if (sim >= 0.3) {
        const existing = candidates.find(c => c.foundTitle === titleTokens[i]);
        if (!existing) {
          candidates.push({
            foundTitle: titleTokens[i],
            imageUrl: searchImgs[i].replace(/\/cache\/1\/[^/]+\/[^/]+\/[^/]+\//g, "/"),
            similarity: sim,
          });
        }
      }
    }
  } catch { }

  candidates.sort((a, b) => b.similarity - a.similarity);
  return candidates;
}

export function isValidCover(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.includes("placehold")) return false;
  if (url.includes("via.placeholder")) return false;
  if (url.includes("placeholder")) return false;
  if (url.startsWith("/uploads/")) return false;
  if (url.includes("knjiga.ba/media/catalog/product")) return true;
  if (url.includes("buybook.ba")) return false;
  if (url.includes("books.google.com")) return true;
  if (url.includes("openlibrary.org")) return true;
  return url.startsWith("http");
}

export async function searchCoverForBook(title: string, author: string): Promise<string | null> {
  const candidates = await searchKnjigaBaCandidates(title, author);
  const exact = candidates.find(c => c.similarity >= 0.7);
  return exact ? exact.imageUrl : null;
}

export async function fetchBookCovers() {
  console.log("Fetching book covers (URL mode - no local download)...");

  const allBooks = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    coverImage: books.coverImage,
  }).from(books);

  const needsCover = allBooks.filter(b => !isValidCover(b.coverImage));

  if (needsCover.length === 0) {
    console.log("All books have external cover URLs or use generated placeholders.");
    return;
  }

  if (needsCover.length > 10) {
    console.log(`${needsCover.length} books need cover URLs — skipping auto-fetch on startup (use admin panel to fetch).`);
    return;
  }

  console.log(`Found ${needsCover.length} books needing cover URLs.`);
  let found = 0;

  for (const book of needsCover) {
    const imageUrl = await searchCoverForBook(book.title, book.author);
    if (imageUrl) {
      await db.update(books).set({ coverImage: imageUrl }).where(eq(books.id, book.id));
      console.log(`  [OK] ${book.title}`);
      found++;
    } else {
      console.log(`  [MISS] ${book.title}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`Covers: ${found} URLs set, ${needsCover.length - found} still missing.`);
}

export type CoverFetchStatus = {
  running: boolean;
  total: number;
  processed: number;
  found: number;
  failed: number;
  done: boolean;
  pendingReview: CoverCandidate[];
  logs: string[];
};

export function createCoverFetchStatus(): CoverFetchStatus {
  return {
    running: false, total: 0, processed: 0, found: 0, failed: 0, done: false,
    pendingReview: [], logs: [],
  };
}

export async function fetchAllBookCovers(
  status: CoverFetchStatus,
  onProgress?: (msg: string) => void,
): Promise<{ found: number; failed: number; total: number }> {
  const allBooks = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    coverImage: books.coverImage,
  }).from(books);

  const needsCover = allBooks.filter(b => !isValidCover(b.coverImage));

  status.total = needsCover.length;
  status.found = 0;
  status.failed = 0;
  status.processed = 0;
  status.pendingReview = [];

  if (onProgress) onProgress(`Pronađeno ${needsCover.length} knjiga bez korica od ${allBooks.length} ukupno.`);

  for (const book of needsCover) {
    const candidates = await searchKnjigaBaCandidates(book.title, book.author);

    if (candidates.length > 0 && candidates[0].similarity >= 0.7) {
      await db.update(books).set({ coverImage: candidates[0].imageUrl }).where(eq(books.id, book.id));
      status.found++;
      status.processed++;
      if (onProgress) onProgress(`[${status.processed}/${status.total}] ✓ ${book.title}`);
    } else if (candidates.length > 0 && candidates[0].similarity >= 0.3) {
      const best = candidates[0];
      status.pendingReview.push({
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        foundTitle: best.foundTitle,
        imageUrl: best.imageUrl,
        confidence: "similar",
        similarityScore: Math.round(best.similarity * 100),
      });
      status.processed++;
      if (onProgress) onProgress(`[${status.processed}/${status.total}] ? ${book.title} → "${best.foundTitle}" (${Math.round(best.similarity * 100)}%)`);
    } else {
      status.failed++;
      status.processed++;
      if (onProgress) onProgress(`[${status.processed}/${status.total}] ✗ ${book.title}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return { found: status.found, failed: status.failed, total: status.total };
}
