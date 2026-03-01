import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";

const BASE_URL = "https://citanje.ba";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildOgHtml(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  jsonLd?: string;
}): string {
  const t = escapeHtml(opts.title);
  const d = escapeHtml(opts.description);
  const img = opts.image ? escapeHtml(opts.image) : `${BASE_URL}/og-image.png`;

  return `<!DOCTYPE html>
<html lang="bs">
<head>
<meta charset="UTF-8"/>
<title>${t}</title>
<meta name="description" content="${d}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${escapeHtml(opts.url)}"/>
<meta property="og:title" content="${t}"/>
<meta property="og:description" content="${d}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:site_name" content="Čitanje"/>
<meta property="og:locale" content="bs_BA"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${t}"/>
<meta name="twitter:description" content="${d}"/>
<meta name="twitter:image" content="${img}"/>
<link rel="canonical" href="${escapeHtml(opts.url)}"/>
${opts.jsonLd ? `<script type="application/ld+json">${opts.jsonLd}</script>` : ""}
<meta http-equiv="refresh" content="0;url=${escapeHtml(opts.url)}"/>
</head>
<body><p>Preusmjeravanje...</p></body>
</html>`;
}

const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Viber|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|vkShare|Googlebot/i;

function isCrawler(req: Request): boolean {
  const ua = req.headers["user-agent"] || "";
  return BOT_UA.test(ua);
}

export function ogMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) return next();
    if (!isCrawler(req)) return next();

    try {
      const bookMatch = req.path.match(/^\/knjiga\/([a-zA-Z0-9_-]+)$/);
      if (bookMatch) {
        const book = await storage.getBook(bookMatch[1]);
        if (book) {
          const bookDesc = book.description
            ? book.description.substring(0, 200)
            : `Pročitaj "${book.title}" od ${book.author} i riješi kviz na platformi Čitanje.`;
          const jsonLd = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "author": { "@type": "Person", "name": book.author },
            "description": bookDesc,
            "inLanguage": book.language || "bs",
            "isbn": book.isbn || undefined,
            "numberOfPages": book.pages || undefined,
            "image": book.coverImage || undefined,
            "publisher": book.publisher || undefined,
            "url": `${BASE_URL}/knjiga/${book.id}`,
          });
          const html = buildOgHtml({
            title: `${book.title} - ${book.author} | Čitanje`,
            description: bookDesc,
            url: `${BASE_URL}/knjiga/${book.id}`,
            image: book.coverImage || undefined,
            jsonLd,
          });
          return res.status(200).set("Content-Type", "text/html").end(html);
        }
      }

      const blogMatch = req.path.match(/^\/blog\/([a-zA-Z0-9_-]+)$/);
      if (blogMatch) {
        const post = await storage.getBlogPost(blogMatch[1]);
        if (post) {
          const html = buildOgHtml({
            title: `${post.title} | Čitanje Blog`,
            description: post.summary
              ? post.summary.substring(0, 200)
              : post.content.substring(0, 200),
            url: `${BASE_URL}/blog/${post.id}`,
            image: post.coverImage || undefined,
          });
          return res.status(200).set("Content-Type", "text/html").end(html);
        }
      }
    } catch (err) {
      console.error("[og-middleware] Error:", err);
    }

    return next();
  };
}
