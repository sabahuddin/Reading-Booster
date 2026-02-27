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

async function searchKnjigaBa(title: string, author: string): Promise<string | null> {
  try {
    const query = slugify(title);
    const url = `https://www.knjiga.ba/catalogsearch/result/?q=${query}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const html = await res.text();

    const productLinks = [...html.matchAll(/href="(https:\/\/www\.knjiga\.ba\/[^"]*\.html)"/g)]
      .map(m => m[1])
      .filter(l => !l.includes("catalogsearch") && !l.includes("customer"));

    const uniqueLinks = [...new Set(productLinks)];
    const normTitle = normalizeTitle(title);
    const normAuthor = normalizeTitle(author);

    for (const link of uniqueLinks.slice(0, 5)) {
      try {
        const pRes = await fetchWithTimeout(link);
        if (!pRes.ok) continue;
        const pHtml = await pRes.text();

        const pageTitleMatch = pHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
        const pageTitle = pageTitleMatch ? normalizeTitle(pageTitleMatch[1]) : "";
        const pageContent = normalizeTitle(pHtml.replace(/<[^>]*>/g, " ").substring(0, 5000));

        const titleMatch = pageTitle.includes(normTitle) || pageContent.includes(normTitle);
        const authorMatch = pageContent.includes(normAuthor);

        if (titleMatch || authorMatch) {
          const allImgs = [...pHtml.matchAll(/src="(https:\/\/www\.knjiga\.ba\/media\/catalog\/product[^"]+\.(jpg|jpeg|png|webp))"/gi)]
            .map(m => m[1]);
          for (const img of allImgs) {
            const direct = img.replace(/\/cache\/1\/[^/]+\/[^/]+\/[^/]+\//g, "/");
            return direct;
          }
        }
      } catch { continue; }
    }

    const searchImgs = [...html.matchAll(/src="(https:\/\/www\.knjiga\.ba\/media\/catalog\/product\/cache\/1\/small_image\/120x\/[^"]+)"/g)]
      .map(m => m[1]);
    const titleTokens = [...html.matchAll(/<h2[^>]*class="product-name"[^>]*>.*?<a[^>]*>([^<]*)<\/a>/gs)]
      .map(m => m[1].trim());

    for (let i = 0; i < titleTokens.length && i < searchImgs.length; i++) {
      const n = normalizeTitle(titleTokens[i]);
      if (n.includes(normTitle) || normTitle.includes(n)) {
        return searchImgs[i].replace(/\/cache\/1\/[^/]+\/[^/]+\/[^/]+\//g, "/");
      }
    }
  } catch { }
  return null;
}

async function searchBuybook(title: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(title);
    const url = `https://buybook.ba/search?q=${query}&type=product`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const html = await res.text();

    const normTitle = normalizeTitle(title);

    const productBlocks = html.split(/class="[^"]*product-card[^"]*"/);
    for (const block of productBlocks.slice(1, 6)) {
      const blockNorm = normalizeTitle(block.replace(/<[^>]*>/g, " ").substring(0, 500));
      if (blockNorm.includes(normTitle)) {
        const imgMatch = block.match(/(src|data-src)="(\/\/buybook\.ba\/cdn\/shop\/files\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
        if (imgMatch) {
          let imgUrl = imgMatch[2];
          if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
          imgUrl = imgUrl.replace(/&width=\d+/, "&width=600");
          return imgUrl;
        }
      }
    }

    const imgMatch = html.match(/(src|data-src)="(\/\/buybook\.ba\/cdn\/shop\/files\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
    if (imgMatch) {
      let imgUrl = imgMatch[2];
      if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
      return imgUrl;
    }
  } catch { }
  return null;
}

async function searchLaguna(title: string): Promise<string | null> {
  try {
    const slug = slugify(title).replace(/\+/g, "_");
    const url = `https://www.laguna.rs/s_${slug}.html`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const html = await res.text();

    const imgMatch = html.match(/src="(https?:\/\/[^"]*laguna[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i);
    if (imgMatch) return imgMatch[1];
  } catch { }
  return null;
}

function isValidCover(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.includes("placehold")) return false;
  if (url.includes("via.placeholder")) return false;
  if (url.includes("placeholder")) return false;
  if (url.startsWith("/uploads/")) return false;
  if (url.includes("knjiga.ba/media/catalog/product")) return true;
  if (url.includes("buybook.ba/cdn/shop")) return true;
  if (url.includes("laguna.rs")) return true;
  if (url.includes("books.google.com")) return true;
  if (url.includes("openlibrary.org")) return true;
  return url.startsWith("http");
}

export async function searchCoverForBook(title: string, author: string): Promise<string | null> {
  let imageUrl = await searchKnjigaBa(title, author);
  if (imageUrl) return imageUrl;

  imageUrl = await searchBuybook(title);
  if (imageUrl) return imageUrl;

  imageUrl = await searchLaguna(title);
  if (imageUrl) return imageUrl;

  return null;
}

export async function fetchBookCovers() {
  console.log("Fetching book covers (URL mode - no local download)...");

  const allBooks = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    coverImage: books.coverImage,
  }).from(books);

  const needsCover = allBooks.filter(b => {
    if (!b.coverImage) return true;
    if (b.coverImage.includes("placehold")) return true;
    if (b.coverImage.includes("via.placeholder")) return true;
    if (b.coverImage.startsWith("/uploads/")) return true;
    return false;
  });

  if (needsCover.length === 0) {
    console.log("All books have external cover URLs.");
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

export async function fetchAllBookCovers(onProgress?: (msg: string) => void): Promise<{ found: number; failed: number; total: number }> {
  const allBooks = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    coverImage: books.coverImage,
  }).from(books);

  const needsCover = allBooks.filter(b => !isValidCover(b.coverImage));

  const total = needsCover.length;
  let found = 0;
  let failed = 0;

  if (onProgress) onProgress(`Pronađeno ${total} knjiga bez korica od ${allBooks.length} ukupno.`);

  for (const book of needsCover) {
    const imageUrl = await searchCoverForBook(book.title, book.author);
    if (imageUrl) {
      await db.update(books).set({ coverImage: imageUrl }).where(eq(books.id, book.id));
      found++;
      if (onProgress) onProgress(`[${found + failed}/${total}] ✓ ${book.title}`);
    } else {
      failed++;
      if (onProgress) onProgress(`[${found + failed}/${total}] ✗ ${book.title}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return { found, failed, total };
}
