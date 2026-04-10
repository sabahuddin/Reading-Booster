/**
 * Fetch missing book details from knjiga.ba
 * Usage: node scripts/fetch-book-details.cjs
 *
 * Fetches: description, publisher, publication_year, page_count, publication_city
 * for all books that have missing or very short descriptions.
 */

const pg = require("pg");

const DELAY_MS = 600;
const MIN_DESC_LENGTH = 30;
const MAX_PRODUCT_PAGES = 2;
const PAGE_FETCH_TIMEOUT_MS = 8000;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "+");
}

function normalizeStr(s) {
  return s
    .toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]/g, "");
}

function similarity(a, b) {
  const na = normalizeStr(a);
  const nb = normalizeStr(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  const wordsA = a.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F ]/g, "").split(/\s+/).filter(w => w.length > 2);
  const wordsB = b.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F ]/g, "").split(/\s+/).filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const matching = wordsA.filter(w => wordsB.some(wb => wb.includes(w) || w.includes(wb)));
  return matching.length / Math.max(wordsA.length, wordsB.length);
}

async function fetchHtml(url, timeoutMs = PAGE_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
        "Accept-Language": "bs-BA,bs;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseTableField(html, ...labels) {
  for (const label of labels) {
    // Try th/td pattern
    const re = new RegExp(`<th[^>]*>[^<]*${label}[^<]*<\/th>\\s*<td[^>]*>([\\s\\S]*?)<\/td>`, "gi");
    const m = re.exec(html);
    if (m) {
      const val = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (val) return val;
    }
    // Try dt/dd pattern
    const re2 = new RegExp(`<dt[^>]*>[^<]*${label}[^<]*<\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\/dd>`, "gi");
    const m2 = re2.exec(html);
    if (m2) {
      const val = m2[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (val) return val;
    }
    // Try span or li pattern like "Izdavač: Buybook"
    const re3 = new RegExp(`${label}[\\s:]*<[^>]*>\\s*([^<]+)`, "i");
    const m3 = re3.exec(html);
    if (m3) {
      const val = m3[1].trim();
      if (val) return val;
    }
  }
  return null;
}

function parseDescription(html) {
  // Try class="std" divs
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

  // Try product-description section
  const pdMatch = html.match(/id="tab-description"[^>]*>([\s\S]{30,3000}?)<\/div>/i);
  if (pdMatch) {
    const text = pdMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length >= MIN_DESC_LENGTH) return text.substring(0, 2000);
  }

  // Try description class
  const descMatch = html.match(/class="[^"]*description[^"]*"[^>]*>([\s\S]{30,2000}?)<\/(?:div|p|section)>/i);
  if (descMatch) {
    const text = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length >= MIN_DESC_LENGTH) return text.substring(0, 2000);
  }

  return null;
}

async function getBookDetailsFromPage(url, bookTitle) {
  const html = await fetchHtml(url);
  if (!html) return null;

  // Verify the page matches the book (check h1 or title)
  const h1Match = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/i) ||
                  html.match(/<h1[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                  html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const pageTitle = h1Match ? h1Match[1].trim() : "";
  const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleTag = titleTagMatch ? titleTagMatch[1].replace(/\s*[-|].*knjiga\.ba.*/i, "").trim() : "";

  const sim = Math.max(
    similarity(bookTitle, pageTitle),
    similarity(bookTitle, titleTag)
  );

  if (sim < 0.4) return null;

  const description = parseDescription(html);

  // Publisher
  const publisher = parseTableField(html, "Izdava[čc]", "Publisher");

  // Year
  const yearRaw = parseTableField(html, "Godina", "Year", "Datum");
  let year = null;
  if (yearRaw) {
    const yearMatch = yearRaw.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) year = parseInt(yearMatch[0]);
  }

  // Page count
  const pagesRaw = parseTableField(html, "Broj stranica", "Stranica", "Pages");
  let pageCount = null;
  if (pagesRaw) {
    const pagesMatch = pagesRaw.match(/\b(\d{1,4})\b/);
    if (pagesMatch) pageCount = parseInt(pagesMatch[1]);
  }

  // City from publisher (e.g. "Buybook Sarajevo" → city=Sarajevo)
  let city = null;
  if (publisher) {
    const cityMatch = publisher.match(/\b(Sarajevo|Tuzla|Mostar|Banja\s*Luka|Zenica|Bihać|Trebinje|Beograd|Zagreb|Ljubljana)\b/i);
    if (cityMatch) city = cityMatch[1];
  }

  return { description, publisher, year, pageCount, city, sim };
}

async function findBookOnKnjigaBa(title, author) {
  // For very short titles, add author to narrow results
  let query = slugify(title);
  if (query.length < 5 && author && author !== "Grupa autora") {
    const authorSlug = slugify(author.split(" ")[0]);
    query = `${query}+${authorSlug}`;
  }
  const url = `https://www.knjiga.ba/catalogsearch/result/?q=${query}`;
  const html = await fetchHtml(url, 10000);
  if (!html) return [];

  // Extract product links from search results
  const productLinks = [...html.matchAll(/class="product-name"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g)]
    .map(m => m[1])
    .filter(l => l.includes("knjiga.ba"));

  // Also try to find from search listing titles
  const titleLinks = [...html.matchAll(/href="(https:\/\/www\.knjiga\.ba\/[^"]+\.html)"/g)]
    .map(m => m[1])
    .filter(l => !["catalog", "customer", "media", "shipping", "price", "contact", "wishlist", "checkout", "compare", "rss", "products_new", "html/", "html.html"].some(x => l.includes(x)));

  const allLinks = [...new Set([...productLinks, ...titleLinks])];
  return allLinks.slice(0, MAX_PRODUCT_PAGES);
}

async function processBook(client, book) {
  const links = await findBookOnKnjigaBa(book.title, book.author);

  if (links.length === 0) {
    return null;
  }

  for (const link of links) {
    const details = await getBookDetailsFromPage(link, book.title);
    if (!details) continue;

    const updates = {};
    if (details.description && details.description.length >= MIN_DESC_LENGTH && (!book.description || book.description.length < MIN_DESC_LENGTH)) {
      updates.description = details.description;
    }
    if (details.publisher && (!book.publisher || book.publisher.trim() === "")) {
      // Clean publisher (remove city names if separate)
      updates.publisher = details.publisher;
    }
    if (details.year && details.year >= 1900 && details.year <= 2026 && !book.publication_year) {
      updates.publication_year = details.year;
    }
    if (details.pageCount && details.pageCount > 0 && !book.page_count) {
      updates.page_count = details.pageCount;
    }
    if (details.city && !book.publication_city) {
      updates.publication_city = details.city;
    }

    if (Object.keys(updates).length === 0) {
      return { found: false, reason: "no new data from page" };
    }

    // Build and run UPDATE query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
    await client.query(
      `UPDATE books SET ${setClause} WHERE id = $1`,
      [book.id, ...values]
    );

    return { found: true, updates };
  }

  return { found: false, reason: "no matching pages" };
}

async function main() {
  console.log("=== fetch-book-details.cjs ===");
  console.log("Fetching missing book details from knjiga.ba...\n");

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const { rows: books } = await client.query(`
      SELECT id, title, author, description, publisher, publication_year, page_count, publication_city
      FROM books
      WHERE description IS NULL OR description = '' OR length(description) < ${MIN_DESC_LENGTH}
      ORDER BY title
    `);

    console.log(`Found ${books.length} books needing details.\n`);

    let updated = 0, notFound = 0, noNewData = 0;

    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const prefix = `[${i + 1}/${books.length}]`;

      process.stdout.write(`${prefix} "${book.title}" (${book.author || 'N/A'})... `);

      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 30000));
        const result = await Promise.race([processBook(client, book), timeoutPromise]);

        if (!result) {
          console.log("✗ not found on knjiga.ba");
          notFound++;
        } else if (!result.found) {
          console.log(`- ${result.reason}`);
          noNewData++;
        } else {
          const fieldNames = Object.keys(result.updates).join(", ");
          console.log(`✓ updated: ${fieldNames}`);
          updated++;
        }
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
      }

      await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log(`\n=== DONE ===`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
    console.log(`Found but no new data: ${noNewData}`);
    console.log(`Total processed: ${books.length}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
