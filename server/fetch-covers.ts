import { db } from "./db";
import { books } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from "crypto";

const uploadsDir = path.join(process.cwd(), "uploads", "covers");
fs.mkdirSync(uploadsDir, { recursive: true });

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

async function downloadImage(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(imageUrl, 15000);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image")) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) return null;

    let ext = ".jpg";
    if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("webp")) ext = ".webp";

    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/covers/${filename}`;
  } catch {
    return null;
  }
}

export async function fetchBookCovers() {
  console.log("Fetching book covers...");

  const allBooks = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    coverImage: books.coverImage,
  }).from(books);

  const needsCover = allBooks.filter(b => {
    if (!b.coverImage) return true;
    if (b.coverImage.startsWith("/uploads/")) return false;
    if (b.coverImage.includes("placehold")) return true;
    if (b.coverImage.includes("via.placeholder")) return true;
    return false;
  });

  if (needsCover.length === 0) {
    console.log("All books have covers.");
    return;
  }

  console.log(`Found ${needsCover.length} books needing covers.`);
  let found = 0;

  for (const book of needsCover) {
    let imageUrl: string | null = null;
    let source = "";

    imageUrl = await searchKnjigaBa(book.title, book.author);
    if (imageUrl) source = "knjiga.ba";

    if (!imageUrl) {
      imageUrl = await searchBuybook(book.title);
      if (imageUrl) source = "buybook.ba";
    }

    if (imageUrl) {
      const localPath = await downloadImage(imageUrl);
      if (localPath) {
        await db.update(books).set({ coverImage: localPath }).where(eq(books.id, book.id));
        console.log(`  [OK] ${book.title} <- ${source}`);
        found++;
      } else {
        console.log(`  [MISS] ${book.title} - download failed`);
      }
    } else {
      console.log(`  [MISS] ${book.title} - no cover found`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`Covers: ${found} downloaded, ${needsCover.length - found} missing.`);
}

async function fullScrape() {
  console.log("=== Full cover scrape from knjiga.ba, buybook.ba, laguna.rs ===\n");

  const allBooks = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    coverImage: books.coverImage,
  }).from(books);

  const needsCover = allBooks.filter(b => {
    if (!b.coverImage) return true;
    if (b.coverImage.startsWith("/uploads/")) return false;
    return true;
  });

  console.log(`Total books: ${allBooks.length}`);
  console.log(`Books needing covers (non-local): ${needsCover.length}\n`);

  let found = 0;
  let failed = 0;

  for (const book of needsCover) {
    process.stdout.write(`[${found + failed + 1}/${needsCover.length}] ${book.title}... `);

    let imageUrl: string | null = null;
    let source = "";

    imageUrl = await searchKnjigaBa(book.title, book.author);
    if (imageUrl) source = "knjiga.ba";

    if (!imageUrl) {
      imageUrl = await searchBuybook(book.title);
      if (imageUrl) source = "buybook.ba";
    }

    if (!imageUrl) {
      imageUrl = await searchLaguna(book.title);
      if (imageUrl) source = "laguna.rs";
    }

    if (imageUrl) {
      const localPath = await downloadImage(imageUrl);
      if (localPath) {
        await db.update(books).set({ coverImage: localPath }).where(eq(books.id, book.id));
        console.log(`OK [${source}]`);
        found++;
      } else {
        console.log(`DOWNLOAD FAILED from ${source}`);
        failed++;
      }
    } else {
      console.log(`NOT FOUND`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n=== Results: ${found} found, ${failed} missing ===`);
  process.exit(0);
}

if (process.argv[1]?.includes("fetch-covers")) {
  fullScrape().catch(e => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
}
