import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import multer from "multer";
import express from "express";
import xss from "xss";
import { storage } from "./storage";
import { requireAuth, requireAdmin, requireTeacher, requireSchoolAdmin, loginLimiter } from "./index";
import {
  insertUserSchema,
  insertBookSchema,
  insertQuizSchema,
  insertQuestionSchema,
  insertQuizResultSchema,
  insertBlogPostSchema,
  insertBlogCommentSchema,
  insertBlogRatingSchema,
  insertBookRatingSchema,
  insertContactMessageSchema,
  insertPartnerSchema,
  insertChallengeSchema,
  insertGenreSchema,
  insertBookListingSchema,
  insertDuelSchema,
} from "@shared/schema";

const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(path.join(uploadsDir, "covers"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "books"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "logos"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "blog"), { recursive: true });

const coverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "covers")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const bookFileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "books")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "logos")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const uploadCover = multer({ storage: coverStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Samo slike su dozvoljene"));
}});

const uploadBookFile = multer({ storage: bookFileStorage, limits: { fileSize: 50 * 1024 * 1024 } });

const uploadLogo = multer({ storage: logoStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Samo slike su dozvoljene"));
}});

const blogImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "blog")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});
const uploadBlogImage = multer({ storage: blogImageStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Samo slike su dozvoljene"));
}});

const zipDir = path.join(uploadsDir, "zip");
fs.mkdirSync(zipDir, { recursive: true });
const zipStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, zipDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomBytes(4).toString("hex")}.zip`),
});
const uploadZip = multer({ storage: zipStorage, limits: { fileSize: 200 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed" || file.originalname.endsWith(".zip")) cb(null, true);
  else cb(new Error("Samo ZIP datoteke su dozvoljene"));
}});

const csvDir = path.join(uploadsDir, "csv");
fs.mkdirSync(csvDir, { recursive: true });
const csvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, csvDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomBytes(4).toString("hex")}.csv`),
});
const uploadCSV = multer({ storage: csvStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) cb(null, true);
  else cb(new Error("Samo CSV datoteke su dozvoljene"));
}});

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  let headerLineIndex = 0;
  const knownHeaders = ["title", "author", "naslov", "autor", "bookTitle", "questionText"];
  if (!knownHeaders.some(h => lines[0].toLowerCase().includes(h))) {
    headerLineIndex = 1;
    if (lines.length < 3) return [];
  }

  const headerLine = lines[headerLineIndex];
  const delimiter = headerLine.includes(";") ? ";" : ",";

  function splitCSVLine(line: string, delim: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delim && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^"|"$/g, ""));
  }

  const headers = splitCSVLine(headerLine, delimiter);
  const rows: Record<string, string>[] = [];
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i], delimiter);
    if (values.length >= headers.length - 1) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
      rows.push(row);
    }
  }
  return rows;
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: "Lozinka mora imati najmanje 8 karaktera" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Lozinka mora sadržavati barem jedno veliko slovo" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Lozinka mora sadržavati barem jedan broj" };
  return { valid: true };
}

const xssOptions: xss.IFilterXSSOptions = {
  whiteList: {
    ...xss.whiteList,
    mark: ["class"],
  },
  onTagAttr(tag, name, value) {
    if (tag === "mark" && name === "class") {
      const allowed = ["highlight-yellow", "highlight-green", "highlight-orange"];
      if (allowed.includes(value)) {
        return `${name}="${value}"`;
      }
    }
    return undefined as unknown as string;
  },
};

function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key], xssOptions);
      }
    }
  }
  next();
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}

function generateUsername(fullName: string): string {
  const parts = fullName.toLowerCase().trim().split(/\s+/);
  const base = parts
    .map(p => p.replace(/[čćžšđ]/g, (c) => ({ č: "c", ć: "c", ž: "z", š: "s", đ: "dj" }[c] || c)).replace(/[^a-z]/g, ""))
    .join(".");
  const num = Math.floor(10 + Math.random() * 90);
  return `${base}${num}`;
}

function generatePassword(): string {
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = lower + upper + digits;
  let pw = "";
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 2; i < 8; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }
  return pw.split("").sort(() => Math.random() - 0.5).join("");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use("/uploads", express.static(uploadsDir));

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /ucenik
Disallow: /ucitelj
Disallow: /roditelj
Disallow: /skola
Disallow: /citanje
Disallow: /api

Sitemap: https://citanje.ba/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const books = await storage.getAllBooks();
      const blogPosts = await storage.getAllBlogPosts();
      const baseUrl = "https://citanje.ba";

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "daily" },
        { loc: "/biblioteka", priority: "0.9", changefreq: "daily" },
        { loc: "/razmjena", priority: "0.7", changefreq: "daily" },
        { loc: "/blog", priority: "0.8", changefreq: "weekly" },
        { loc: "/cijene", priority: "0.6", changefreq: "monthly" },
        { loc: "/kontakt", priority: "0.5", changefreq: "monthly" },
        { loc: "/prijava", priority: "0.5", changefreq: "monthly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      for (const page of staticPages) {
        xml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      for (const book of books) {
        xml += `  <url>
    <loc>${baseUrl}/knjiga/${book.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }

      for (const post of blogPosts) {
        xml += `  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      xml += `</urlset>`;
      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/api/deploy-check", async (_req, res) => {
    const pg = await import("pg");
    const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
    try {
      const books = await pool.query("SELECT COUNT(*) FROM books");
      const questions = await pool.query("SELECT COUNT(*) FROM questions");
      const quizzes = await pool.query("SELECT COUNT(*) FROM quizzes");
      res.json({
        version: "2026-02-22-v7-export",
        deployedAt: new Date().toISOString(),
        database: {
          books: parseInt(books.rows[0].count),
          quizzes: parseInt(quizzes.rows[0].count),
          questions: parseInt(questions.rows[0].count),
        }
      });
    } catch (e: any) {
      res.json({ version: "2026-02-22-v7-export", error: e.message });
    } finally {
      await pool.end();
    }
  });

  app.use("/api", sanitizeInput);

  // ==================== UPLOAD ROUTES ====================

  app.post("/api/upload/cover", requireAdmin, uploadCover.single("cover"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/covers/${req.file.filename}`;
    return res.json({ url });
  });

  app.post("/api/upload/blog-image", requireAdmin, uploadBlogImage.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/blog/${req.file.filename}`;
    return res.json({ url });
  });

  app.post("/api/admin/upload/covers-zip", requireAdmin, uploadZip.single("zip"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "ZIP datoteka je obavezna" });
      
      const AdmZip = (await import("adm-zip")).default;
      const zip = new AdmZip(req.file.path);
      const entries = zip.getEntries();
      
      const allBooks = await storage.getAllBooks();
      const booksByTitle = new Map<string, typeof allBooks[0]>();
      for (const b of allBooks) {
        booksByTitle.set(b.title.toLowerCase(), b);
      }

      const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
      const updated: string[] = [];
      const notFound: string[] = [];
      const skippedFiles: string[] = [];

      for (const entry of entries) {
        if (entry.isDirectory) continue;
        const fileName = path.basename(entry.entryName);
        if (fileName.startsWith(".") || fileName.startsWith("__")) continue;
        
        const ext = path.extname(fileName).toLowerCase();
        if (!imageExts.includes(ext)) {
          skippedFiles.push(fileName);
          continue;
        }

        const titleFromFile = path.basename(fileName, ext).trim();
        const book = booksByTitle.get(titleFromFile.toLowerCase());
        if (!book) {
          notFound.push(titleFromFile);
          continue;
        }

        const newFilename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
        const destPath = path.join(uploadsDir, "covers", newFilename);
        fs.writeFileSync(destPath, entry.getData());

        const coverUrl = `/uploads/covers/${newFilename}`;
        await storage.updateBook(book.id, { coverImage: coverUrl });
        updated.push(book.title);
      }

      fs.unlinkSync(req.file.path);
      return res.json({
        updated: updated.length,
        updatedTitles: updated,
        notFound: notFound.length,
        notFoundTitles: notFound,
        skipped: skippedFiles.length,
        skippedFiles,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  const { createCoverFetchStatus, fetchAllBookCovers: fetchAllCovers, isValidCover: isValidCoverFn, downloadImageToLocal, migrateExternalCoversToLocal, isExternalCover } = await import("./fetch-covers");
  const coverFetchStatus = createCoverFetchStatus();

  app.post("/api/admin/fetch-covers", requireAdmin, async (_req, res) => {
    if (coverFetchStatus.running) {
      return res.status(409).json({ message: "Pretraga korica je već u toku." });
    }
    try {
      coverFetchStatus.running = true;
      coverFetchStatus.processed = 0;
      coverFetchStatus.found = 0;
      coverFetchStatus.failed = 0;
      coverFetchStatus.done = false;
      coverFetchStatus.pendingReview = [];
      coverFetchStatus.logs = [];

      const allBooks = await storage.getAllBooks();
      const needsCover = allBooks.filter(b => !isValidCoverFn(b.coverImage));
      coverFetchStatus.total = needsCover.length;

      res.json({ message: "Pretraga pokrenuta", total: needsCover.length });

      fetchAllCovers(coverFetchStatus, (msg) => {
        coverFetchStatus.logs.push(msg);
      }).then((result) => {
        coverFetchStatus.found = result.found;
        coverFetchStatus.failed = result.failed;
        coverFetchStatus.done = true;
        coverFetchStatus.running = false;
      }).catch(() => {
        coverFetchStatus.done = true;
        coverFetchStatus.running = false;
      });
    } catch (error: any) {
      coverFetchStatus.running = false;
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/fetch-covers/status", requireAdmin, (_req, res) => {
    return res.json({
      running: coverFetchStatus.running,
      total: coverFetchStatus.total,
      processed: coverFetchStatus.processed,
      found: coverFetchStatus.found,
      failed: coverFetchStatus.failed,
      done: coverFetchStatus.done,
      pendingReview: coverFetchStatus.pendingReview,
      pendingCount: coverFetchStatus.pendingReview.length,
      logs: coverFetchStatus.logs.slice(-5),
    });
  });

  app.post("/api/admin/fetch-covers/approve", requireAdmin, async (req, res) => {
    try {
      const { bookId, imageUrl } = req.body;
      if (!bookId || !imageUrl) return res.status(400).json({ message: "bookId i imageUrl su obavezni" });
      const localPath = await downloadImageToLocal(imageUrl);
      if (localPath) {
        await storage.updateBook(bookId, { coverImage: localPath });
      } else {
        await storage.updateBook(bookId, { coverImage: imageUrl });
      }
      coverFetchStatus.pendingReview = coverFetchStatus.pendingReview.filter(c => c.bookId !== bookId);
      coverFetchStatus.found++;
      return res.json({ message: "Korica odobrena", localPath: localPath || imageUrl });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/fetch-covers/reject", requireAdmin, async (req, res) => {
    try {
      const { bookId } = req.body;
      if (!bookId) return res.status(400).json({ message: "bookId je obavezan" });
      coverFetchStatus.pendingReview = coverFetchStatus.pendingReview.filter(c => c.bookId !== bookId);
      coverFetchStatus.failed++;
      return res.json({ message: "Korica odbijena" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/proxy-image", requireAdmin, async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl || !imageUrl.startsWith("http")) {
        return res.status(400).json({ message: "URL je obavezan" });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const imgRes = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "image/*",
          },
        });
        clearTimeout(timeout);
        if (!imgRes.ok) return res.status(404).json({ message: "Slika nije pronađena" });
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        return res.send(buffer);
      } catch {
        clearTimeout(timeout);
        return res.status(502).json({ message: "Greška pri preuzimanju slike" });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/migrate-covers-local", requireAdmin, async (req, res) => {
    if (coverFetchStatus.running) {
      return res.status(409).json({ message: "Druga operacija sa koricama je u toku." });
    }
    try {
      coverFetchStatus.running = true;
      coverFetchStatus.done = false;
      coverFetchStatus.logs = [];

      res.json({ message: "Migracija eksternih korica pokrenuta" });

      migrateExternalCoversToLocal((msg) => {
        coverFetchStatus.logs.push(msg);
      }).then((result) => {
        coverFetchStatus.logs.push(`Završeno: ${result.migrated} migrirano, ${result.failed} neuspješno od ${result.total} ukupno.`);
        coverFetchStatus.done = true;
        coverFetchStatus.running = false;
      }).catch(() => {
        coverFetchStatus.done = true;
        coverFetchStatus.running = false;
      });
    } catch (error: any) {
      coverFetchStatus.running = false;
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/generate-quiz", requireAdmin, async (req, res) => {
    try {
      const { bookId } = req.body;
      if (!bookId) return res.status(400).json({ message: "bookId je obavezan" });

      const book = await storage.getBook(bookId);
      if (!book) return res.status(404).json({ message: "Knjiga nije pronađena" });

      const existingQuizzes = await storage.getQuizzesByBookId(bookId);
      if (existingQuizzes.length > 0) {
        return res.status(400).json({ message: "Kviz za ovu knjigu već postoji" });
      }

      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ message: "AI generiranje nije dostupno. Postavite OPENAI_API_KEY environment varijablu." });
      }
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
      });

      const ageLabels: Record<string, string> = {
        R1: "djeca 6-9 godina",
        R4: "djeca 10-12 godina",
        R7: "tinejdžeri 13-15 godina",
        O: "omladina 15-18 godina",
        A: "odrasli 18+",
      };
      const ageDesc = ageLabels[book.ageGroup || "R4"] || "djeca";

      const prompt = `Generiraj kviz sa 20 pitanja o knjizi "${book.title}" autora ${book.author}.
Opis knjige: ${book.description || "Nema opisa."}
Ciljana publika: ${ageDesc}
Žanr: ${book.genre || "opći"}

Svako pitanje mora imati:
- Tekst pitanja (na bosanskom/hrvatskom jeziku)
- 4 opcije odgovora (A, B, C, D)
- Tačan odgovor (a, b, c ili d)
- Bodove (1)

Pitanja trebaju testirati razumijevanje sadržaja knjige, likova, radnje i tema.

Odgovori ISKLJUČIVO u JSON formatu:
{
  "questions": [
    {
      "questionText": "Pitanje?",
      "optionA": "Odgovor A",
      "optionB": "Odgovor B",
      "optionC": "Odgovor C",
      "optionD": "Odgovor D",
      "correctAnswer": "a",
      "points": 1
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 8192,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return res.status(500).json({ message: "AI nije generisao odgovor" });

      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        return res.status(500).json({ message: "AI odgovor nije validan JSON" });
      }

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        return res.status(500).json({ message: "AI nije generisao pitanja" });
      }

      const quiz = await storage.createQuiz({
        title: `Kviz: ${book.title}`,
        bookId: book.id,
        quizAuthor: "Citanje.ba",
      });

      let questionsCreated = 0;
      for (const q of parsed.questions) {
        try {
          if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !["a","b","c","d"].includes(q.correctAnswer)) {
            console.warn("Skipping invalid AI question:", q);
            continue;
          }
          await storage.createQuestion({
            quizId: quiz.id,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
          });
          questionsCreated++;
        } catch (e) {
          console.error("Error creating question:", e);
        }
      }

      return res.json({
        message: `Kviz generisan sa ${questionsCreated} pitanja`,
        quiz,
        questionsCreated,
      });
    } catch (error: any) {
      console.error("AI quiz generation error:", error);
      return res.status(500).json({ message: error.message || "Greška pri generisanju kviza" });
    }
  });

  app.post("/api/admin/cleanup-books", requireAdmin, async (_req, res) => {
    try {
      const allBooks = await storage.getAllBooks();
      const titlesCleaned: string[] = [];
      const descsCleaned: string[] = [];

      for (const book of allBooks) {
        const updates: Record<string, any> = {};

        const cleanedTitle = book.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
        if (cleanedTitle !== book.title) {
          updates.title = cleanedTitle;
          titlesCleaned.push(`"${book.title}" → "${cleanedTitle}"`);
        }

        let desc = book.description || "";
        if (/\b(Hrvatsko|Hrvatski|Srpsko|Srpski)\b/i.test(desc)) {
          desc = "";
        }
        desc = desc.trim();

        if (desc !== (book.description || "").trim()) {
          descsCleaned.push(updates.title || book.title);
        }

        if (!desc || desc.length < 5) {
          desc = "Opis nedostaje";
        }

        if (desc !== book.description) {
          updates.description = desc;
        }

        if (Object.keys(updates).length > 0) {
          await storage.updateBook(book.id, updates);
        }
      }

      return res.json({
        totalBooks: allBooks.length,
        titlesCleaned: titlesCleaned.length,
        titlesCleanedList: titlesCleaned,
        descsCleaned: descsCleaned.length,
        descsCleanedList: descsCleaned,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/upload/book", requireAdmin, uploadBookFile.single("book"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/books/${req.file.filename}`;
    return res.json({ url });
  });

  app.post("/api/upload/logo", requireAdmin, uploadLogo.single("logo"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/logos/${req.file.filename}`;
    return res.json({ url });
  });

  // ==================== AUTH ROUTES ====================

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(parsed.data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const isInstitutional = parsed.data.institutionType && parsed.data.institutionRole;

      const passwordCheck = validatePassword(parsed.data.password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ message: passwordCheck.message });
      }

      const hashedPassword = await hashPassword(parsed.data.password);
      const isSchoolAdmin = parsed.data.role === "school_admin";
      const userData: any = {
        ...parsed.data,
        password: hashedPassword,
        role: isSchoolAdmin ? "school_admin" : (isInstitutional ? "teacher" : parsed.data.role),
        ageGroup: parsed.data.ageGroup || "R1",
        approved: (isInstitutional || isSchoolAdmin) ? false : undefined,
      };

      const user = await storage.createUser(userData);

      if (!isInstitutional && !isSchoolAdmin) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }

      const { password, ...userWithoutPassword } = user;

      if (isInstitutional || isSchoolAdmin) {
        return res.status(201).json({ ...userWithoutPassword, pendingApproval: true });
      }

      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if ((user.role === "teacher" || user.role === "school_admin") && user.institutionType && user.approved === false) {
        return res.status(403).json({ message: "Vaš račun čeka odobrenje administratora." });
      }

      const valid = await comparePasswords(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

  // ==================== CHANGE PASSWORD ====================

  app.post("/api/change-password", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Korisnik nije pronađen." });
      }

      if (user.role === "student") {
        return res.status(403).json({ message: "Učenici ne mogu mijenjati lozinku. Obratite se učitelju." });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Trenutna i nova lozinka su obavezne." });
      }

      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Trenutna lozinka nije tačna." });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Nova lozinka mora imati najmanje 8 karaktera." });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ message: "Nova lozinka mora sadržavati veliko slovo." });
      }
      if (!/[0-9]/.test(newPassword)) {
        return res.status(400).json({ message: "Nova lozinka mora sadržavati broj." });
      }

      const hashedPw = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPw } as any);

      return res.json({ message: "Lozinka uspješno promijenjena." });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BOOKS ROUTES ====================

  app.get("/api/books", async (_req, res) => {
    try {
      const allBooks = await storage.getAllBooks();
      const booksWithGenres = await Promise.all(
        allBooks.map(async (book) => {
          const bookGenresList = await storage.getBookGenres(book.id);
          return { ...book, genres: bookGenresList };
        })
      );
      return res.json(booksWithGenres);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id as string);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      const bookGenresList = await storage.getBookGenres(book.id);
      return res.json({ ...book, genres: bookGenresList });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/books", requireAdmin, async (req, res) => {
    try {
      const { genreIds, ...bookData } = req.body;
      const parsed = insertBookSchema.safeParse(bookData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const allBooks = await storage.getAllBooks();
      const duplicate = allBooks.find(b =>
        b.title.toLowerCase() === parsed.data.title.toLowerCase() &&
        b.author.toLowerCase() === parsed.data.author.toLowerCase()
      );
      if (duplicate) {
        return res.status(400).json({ message: `Knjiga "${parsed.data.title}" od autora "${parsed.data.author}" već postoji u bazi.` });
      }
      const book = await storage.createBook(parsed.data);
      if (Array.isArray(genreIds) && genreIds.length > 0) {
        await storage.setBookGenres(book.id, genreIds);
      }
      const bookGenresList = await storage.getBookGenres(book.id);
      return res.status(201).json({ ...book, genres: bookGenresList });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      const { genreIds, ...bookData } = req.body;
      const book = await storage.updateBook(req.params.id as string, bookData);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      if (Array.isArray(genreIds)) {
        await storage.setBookGenres(book.id, genreIds);
      }
      const bookGenresList = await storage.getBookGenres(book.id);
      return res.json({ ...book, genres: bookGenresList });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      await storage.setBookGenres(req.params.id as string, []);
      await storage.deleteBook(req.params.id as string);
      return res.json({ message: "Book deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/books/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { bookIds } = req.body;
      if (!Array.isArray(bookIds) || bookIds.length === 0) {
        return res.status(400).json({ message: "bookIds niz je obavezan" });
      }
      let deleted = 0;
      for (const bookId of bookIds) {
        try {
          await storage.setBookGenres(bookId, []);
          await storage.deleteBook(bookId);
          deleted++;
        } catch {}
      }
      return res.json({ message: `Obrisano ${deleted} knjiga`, deleted });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUIZ ROUTES ====================

  app.get("/api/books/:bookId/quizzes", async (req, res) => {
    try {
      const quizzesList = await storage.getQuizzesByBookId(req.params.bookId as string);
      return res.json(quizzesList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quizzes", requireAdmin, async (_req, res) => {
    try {
      const allQuizzes = await storage.getAllQuizzes();
      const quizzesWithCounts = await Promise.all(
        allQuizzes.map(async (quiz) => {
          const questions = await storage.getQuestionsByQuizId(quiz.id);
          return { ...quiz, questionCount: questions.length };
        })
      );
      return res.json(quizzesWithCounts);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id as string);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      let questionsList = await storage.getQuestionsByQuizId(quiz.id);

      const isAdmin = req.session?.userId ? (await storage.getUser(req.session.userId))?.role === "admin" : false;
      if (!isAdmin && questionsList.length > 20) {
        for (let i = questionsList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
        }
        questionsList = questionsList.slice(0, 20);
      }

      return res.json({ ...quiz, questions: questionsList });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quizzes", requireAdmin, async (req, res) => {
    try {
      const { questions: questionsData, ...quizData } = req.body;
      const parsed = insertQuizSchema.safeParse(quizData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const quiz = await storage.createQuiz(parsed.data);

      if (questionsData && Array.isArray(questionsData) && questionsData.length > 0) {
        for (const q of questionsData) {
          const qParsed = insertQuestionSchema.safeParse({ ...q, quizId: quiz.id });
          if (qParsed.success) {
            await storage.createQuestion(qParsed.data);
          }
        }
      }

      return res.status(201).json(quiz);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/quizzes/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteQuiz(req.params.id as string);
      return res.json({ message: "Quiz deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Provjera može li korisnik raditi određeni kviz (pre-check za UI)
  app.get("/api/quizzes/:id/eligibility", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const quizId = req.params.id as string;
      const existingResult = await storage.getQuizResultByUserAndQuiz(userId, quizId);

      if (!existingResult) {
        return res.json({ canTake: true });
      }

      const existingPassed = existingResult.totalQuestions > 0 &&
        (existingResult.correctAnswers / existingResult.totalQuestions) >= 0.5;

      if (existingPassed) {
        return res.json({ canTake: false, reason: "passed", message: "Ovaj kviz ste već uspješno položili." });
      }

      const cooldown48h = 48 * 60 * 60 * 1000;
      const timeSinceFailed = Date.now() - new Date(existingResult.completedAt).getTime();
      if (timeSinceFailed < cooldown48h) {
        const msLeft = cooldown48h - timeSinceFailed;
        const hoursLeft = Math.floor(msLeft / 3600000);
        const minutesLeft = Math.ceil((msLeft % 3600000) / 60000);
        return res.json({
          canTake: false,
          reason: "cooldown",
          message: `Kviz ste pali. Možete ga ponovo pokušati za ${hoursLeft} sati i ${minutesLeft} minuta.`,
          retryAfterHours: hoursLeft,
        });
      }

      return res.json({ canTake: true });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUESTIONS ROUTES ====================

  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const questionsList = await storage.getQuestionsByQuizId(req.params.quizId as string);
      return res.json(questionsList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/questions", requireAdmin, async (req, res) => {
    try {
      const parsed = insertQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const question = await storage.createQuestion(parsed.data);
      return res.status(201).json(question);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/questions/:id", requireAdmin, async (req, res) => {
    try {
      const question = await storage.updateQuestion(req.params.id as string, req.body);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      return res.json(question);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/questions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteQuestion(req.params.id as string);
      return res.json({ message: "Question deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUIZ RESULTS ROUTES ====================

  app.get("/api/subscription/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });
      const completedQuizzes = await storage.getQuizResultsCountByUserId(user.id);
      // Pretplata privremeno onemogućena — svi korisnici imaju neograničen pristup
      return res.json({
        subscriptionType: user.subscriptionType,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        completedQuizzes,
        freeQuizLimit: null,
        canTakeQuiz: true,
        canParticipateInChallenges: true,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quiz-results", requireAuth, async (req, res) => {
    try {
      const { quizId, answers } = req.body;
      if (!quizId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "quizId and answers array are required" });
      }

      const userId = req.session.userId!;

      // Privremeno onemogućeno ograničenje pretplate
      /*
      const currentUser = await storage.getUser(userId);
      if (currentUser) {
        const isExpired = currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt) < new Date();
        const effectiveType = (currentUser.subscriptionType !== "free" && isExpired) ? "free" : currentUser.subscriptionType;
        if (effectiveType === "free") {
          const completedCount = await storage.getQuizResultsCountByUserId(userId);
          if (completedCount >= 3) {
            return res.status(403).json({ message: "SUBSCRIPTION_REQUIRED", description: "Besplatni paket dozvoljava samo 3 kviza. Nadogradite pretplatu za neograničen pristup." });
          }
        }
      }
      */

      const existingResult = await storage.getQuizResultByUserAndQuiz(userId, quizId);
      if (existingResult) {
        const existingPassed = existingResult.totalQuestions > 0 &&
          (existingResult.correctAnswers / existingResult.totalQuestions) >= 0.5;

        if (existingPassed) {
          return res.status(400).json({ message: "Ovaj kviz ste već uspješno položili." });
        }

        // Kviz je pao — 48h cooldown
        const cooldown48h = 48 * 60 * 60 * 1000;
        const timeSinceFailed = Date.now() - new Date(existingResult.completedAt).getTime();
        if (timeSinceFailed < cooldown48h) {
          const hoursLeft = Math.ceil((cooldown48h - timeSinceFailed) / 3600000);
          const minutesLeft = Math.ceil(((cooldown48h - timeSinceFailed) % 3600000) / 60000);
          return res.status(429).json({
            message: `Kviz ste pali. Možete ga ponovo pokušati za ${hoursLeft} sati i ${minutesLeft} minuta.`,
            retryAfterHours: hoursLeft,
          });
        }

        // 48h je prošlo — obriši stari neuspješni rezultat i dozvoli ponovni pokušaj
        await storage.deleteQuizResultByUserAndQuiz(userId, quizId);
      }

      const allQuestions = await storage.getQuestionsByQuizId(quizId);
      if (allQuestions.length === 0) {
        return res.status(404).json({ message: "No questions found for this quiz" });
      }

      // Ako kviz ima više od 20 pitanja, očekujemo da je klijent poslao samo 20 nasumičnih.
      // Validacija: dozvoljavamo maksimalno 20 pitanja po sesiji ako ih ima više u bazi.
      if (allQuestions.length > 20 && answers.length > 20) {
        return res.status(400).json({ message: "Maksimalno 20 pitanja je dozvoljeno po kvizu." });
      }

      const quiz = await storage.getQuiz(quizId);
      const book = quiz ? await storage.getBook(quiz.bookId) : null;
      const pointsPerQuestion: Record<string, number> = { R1: 1, R4: 3, R7: 5, O: 7, A: 10 };
      const ptsPerQ = pointsPerQuestion[book?.ageGroup || "R1"] || 1;

      const submittedQuestionIds = new Set(answers.map((a: any) => a.questionId));
      const servedQuestions = allQuestions.filter(q => submittedQuestionIds.has(q.id));
      const totalServed = servedQuestions.length;

      let correctCount = 0;
      let wrongCount = 0;

      for (const answer of answers) {
        const question = servedQuestions.find((q) => q.id === answer.questionId);
        if (question) {
          if (answer.selectedAnswer === question.correctAnswer) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      }

      const passPercentage = totalServed > 0 ? (correctCount / totalServed) * 100 : 0;
      const passed = passPercentage >= 50;
      // Netačni odgovori oduzimaju bodove — minimalan score je 0
      let score = passed ? Math.max(0, (correctCount - wrongCount) * ptsPerQ) : 0;

      const result = await storage.createQuizResult({
        userId,
        quizId,
        score,
        totalQuestions: totalServed,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
      });

      if (passed) {
        const updatedUser = await storage.getUser(userId);
        if (updatedUser) {
          await storage.updateUserPoints(userId, updatedUser.points + score);
        }
        if (quiz) {
          await storage.incrementTimesRead(quiz.bookId);
        }
      }

      return res.status(201).json({ ...result, passed, passPercentage: Math.round(passPercentage) });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/subscription/status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const completedCount = await storage.getQuizResultsCountByUserId(userId);
      const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();
      const effectiveType = (user.subscriptionType !== "free" && isExpired) ? "free" : user.subscriptionType;
      const isFree = effectiveType === "free";
      const quizLimit = isFree ? 3 : null;
      const quizzesRemaining = isFree ? Math.max(0, 3 - completedCount) : null;

      return res.json({
        subscriptionType: effectiveType,
        isFree: false, // Uvijek tretiraj kao da nije free za UI (da ne blokira)
        quizLimit: null,
        quizzesUsed: completedCount,
        quizzesRemaining: null,
        expiresAt: user.subscriptionExpiresAt,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-results/my", requireAuth, async (req, res) => {
    try {
      const results = await storage.getQuizResultsByUserId(req.session.userId!);
      const allQuizzes = await storage.getAllQuizzes();
      const allBooks = await storage.getAllBooks();
      const enriched = results.map(r => {
        const quiz = allQuizzes.find(q => q.id === r.quizId);
        const book = quiz ? allBooks.find(b => b.id === quiz.bookId) : null;
        return { ...r, bookTitle: book?.title ?? "Nepoznato", bookAuthor: book?.author ?? "" };
      });
      return res.json(enriched);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-results/my/books", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const results = await storage.getQuizResultsByUserId(userId);
      const passedResults = results.filter(r => r.totalQuestions > 0 && (r.correctAnswers / r.totalQuestions) >= 0.5);
      const allQuizzes = await storage.getAllQuizzes();
      const bookIds = [...new Set(passedResults.map(r => {
        const quiz = allQuizzes.find(q => q.id === r.quizId);
        return quiz?.bookId;
      }).filter(Boolean))] as string[];
      const booksRead = [];
      for (const bookId of bookIds) {
        const book = await storage.getBook(bookId);
        if (book) {
          const qResult = passedResults.find(r => {
            const quiz = allQuizzes.find(q => q.id === r.quizId);
            return quiz?.bookId === bookId;
          });
          booksRead.push({ ...book, quizScore: qResult?.score ?? 0, quizDate: qResult?.completedAt });
        }
      }
      return res.json(booksRead);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-results/user/:userId", requireAuth, async (req, res) => {
    try {
      const role = req.session.userRole;
      const targetUserId = req.params.userId as string;

      if (req.session.userId === targetUserId) {
      } else if (role === "parent") {
        const children = await storage.getChildrenByParentId(req.session.userId!);
        const isChild = children.some((c) => c.id === targetUserId);
        if (!isChild) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (role === "reader") {
        const reader = await storage.getUser(req.session.userId!);
        if (reader?.parentId) {
          const siblings = await storage.getChildrenByParentId(reader.parentId);
          const isSibling = siblings.some((c) => c.id === targetUserId);
          if (!isSibling) {
            return res.status(403).json({ message: "Access denied" });
          }
        } else {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (role !== "teacher" && role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const results = await storage.getQuizResultsByUserId(targetUserId);
      const allQuizzes = await storage.getAllQuizzes();
      const allBooks = await storage.getAllBooks();
      const enriched = results.map(r => {
        const quiz = allQuizzes.find(q => q.id === r.quizId);
        const book = quiz ? allBooks.find(b => b.id === quiz.bookId) : null;
        return { ...r, bookTitle: book?.title ?? "Nepoznato", bookAuthor: book?.author ?? "" };
      });
      return res.json(enriched);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== RANK ROUTES ====================

  app.get("/api/user/rank", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Korisnik nije pronađen" });

      const allUsers = await storage.getAllUsers();
      const activeUsers = allUsers.filter(u => u.points > 0 && u.role !== "admin");

      const sortedGlobal = activeUsers.sort((a, b) => b.points - a.points);
      const globalRank = sortedGlobal.findIndex(u => u.id === userId) + 1;
      const globalTotal = sortedGlobal.length;

      let classRank = null;
      let classTotal = null;
      let schoolRank = null;
      let schoolTotal = null;

      if (user.role === "student") {
        if (user.className && user.schoolName) {
          const classmates = sortedGlobal.filter(u =>
            u.className === user.className &&
            u.schoolName === user.schoolName &&
            u.role === "student"
          );
          classRank = classmates.findIndex(u => u.id === userId) + 1;
          classTotal = classmates.length;
        }
        if (user.schoolName) {
          const schoolmates = sortedGlobal.filter(u =>
            u.schoolName === user.schoolName &&
            u.role === "student"
          );
          schoolRank = schoolmates.findIndex(u => u.id === userId) + 1;
          schoolTotal = schoolmates.length;
        }
      }

      return res.json({
        globalRank: globalRank || null,
        globalTotal,
        classRank,
        classTotal,
        schoolRank,
        schoolTotal,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== LEADERBOARD ROUTES ====================

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const period = (req.query.period as string) || "week";
      const now = new Date();
      let since: Date;

      if (period === "year") {
        since = new Date(now.getFullYear(), 0, 1);
      } else if (period === "month") {
        since = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        const dayOfWeek = now.getDay();
        since = new Date(now);
        since.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        since.setHours(0, 0, 0, 0);
      }

      const ageGroupFilter = req.query.ageGroup as string | undefined;
      if (ageGroupFilter) {
        const leaderboard = await storage.getLeaderboard(since, ageGroupFilter);
        return res.json(leaderboard);
      }
      const topReaders = await storage.getTopReadersSince(since, 10);
      return res.json(topReaders);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARENT ROUTES ====================

  app.get("/api/parent/children", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Samo roditelji mogu pristupiti ovim podacima" });
      }
      const children = await storage.getChildrenByParentId(req.session.userId!);
      const childrenWithoutPasswords = children.map(({ password, ...rest }) => rest);
      return res.json(childrenWithoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/parent/add-child", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Samo roditelji mogu povezati dijete" });
      }
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Korisničko ime i lozinka djeteta su obavezni" });
      }

      const child = await storage.getUserByUsername(username);
      if (!child || child.role !== "student") {
        return res.status(404).json({ message: "Učenik sa tim korisničkim imenom nije pronađen" });
      }

      const isValid = await comparePasswords(password, child.password);
      if (!isValid) {
        return res.status(401).json({ message: "Netačna lozinka za račun djeteta" });
      }

      await storage.updateUser(child.id, { parentId: req.session.userId! });
      return res.json({ message: "Dijete uspješno povezano" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BLOG ROUTES ====================

  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      return res.json(posts);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id as string);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      return res.json(post);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBlogPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const post = await storage.createBlogPost(parsed.data);
      return res.status(201).json(post);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/blog/:id", requireAdmin, async (req, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id as string, req.body);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      return res.json(post);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/blog/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id as string);
      return res.json({ message: "Blog post deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BLOG COMMENTS ROUTES ====================

  app.get("/api/blog/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.id as string);
      return res.json(comments);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/:id/comments", requireAuth, async (req, res) => {
    try {
      const parsed = insertBlogCommentSchema.safeParse({
        ...req.body,
        postId: req.params.id,
        userId: (req.session as any).userId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const comment = await storage.createBlogComment(parsed.data);
      return res.status(201).json(comment);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/blog/:id/comments/:commentId", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      const comments = await storage.getCommentsByPostId(req.params.id as string);
      const comment = comments.find(c => c.id === req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (comment.userId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      await storage.deleteBlogComment(req.params.commentId as string);
      return res.json({ message: "Comment deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BLOG RATINGS ROUTES ====================

  app.get("/api/blog/:id/rating", async (req, res) => {
    try {
      const avg = await storage.getAverageRating(req.params.id as string);
      let userRating = null;
      if ((req.session as any).userId) {
        const ur = await storage.getUserRating(req.params.id as string, (req.session as any).userId);
        userRating = ur?.rating || null;
      }
      return res.json({ ...avg, userRating });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/:id/rating", requireAuth, async (req, res) => {
    try {
      const parsed = insertBlogRatingSchema.safeParse({
        ...req.body,
        postId: req.params.id,
        userId: (req.session as any).userId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      if (parsed.data.rating < 1 || parsed.data.rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      const rating = await storage.upsertBlogRating(parsed.data);
      const avg = await storage.getAverageRating(req.params.id as string);
      return res.json({ rating, ...avg });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BOOK RATING ROUTES ====================

  app.get("/api/books/:id/rating", async (req, res) => {
    try {
      const avg = await storage.getAverageBookRating(req.params.id as string);
      let userRating = null;
      if ((req.session as any).userId) {
        const ur = await storage.getUserBookRating(req.params.id as string, (req.session as any).userId);
        userRating = ur?.rating || null;
      }
      return res.json({ ...avg, userRating });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/books/:id/rating", requireAuth, async (req, res) => {
    try {
      const parsed = insertBookRatingSchema.safeParse({
        ...req.body,
        bookId: req.params.id,
        userId: (req.session as any).userId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      if (parsed.data.rating < 1 || parsed.data.rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      const rating = await storage.upsertBookRating(parsed.data);
      const avg = await storage.getAverageBookRating(req.params.id as string);
      return res.json({ rating, ...avg });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUIZ COMPLETION COUNT ====================

  app.get("/api/quizzes/:id/completions", async (req, res) => {
    try {
      const count = await storage.getQuizCompletionCount(req.params.id as string);
      return res.json({ count });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== CONTACT ROUTES ====================

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const msg = await storage.createContactMessage(parsed.data);
      return res.status(201).json(msg);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/contact", requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      return res.json(messages);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== GENRES ROUTES ====================

  app.get("/api/genres", async (_req, res) => {
    try {
      const genresList = await storage.getAllGenres();
      return res.json(genresList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/genres", requireAdmin, async (req, res) => {
    try {
      const parsed = insertGenreSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const genre = await storage.createGenre(parsed.data);
      return res.status(201).json(genre);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/genres/:id", requireAdmin, async (req, res) => {
    try {
      const genre = await storage.updateGenre(req.params.id as string, req.body);
      if (!genre) {
        return res.status(404).json({ message: "Genre not found" });
      }
      return res.json(genre);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/genres/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteGenre(req.params.id as string);
      return res.json({ message: "Genre deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/books/:id/genres", async (req, res) => {
    try {
      const genresList = await storage.getBookGenres(req.params.id as string);
      return res.json(genresList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/books/:id/genres", requireAdmin, async (req, res) => {
    try {
      const { genreIds } = req.body;
      if (!Array.isArray(genreIds)) {
        return res.status(400).json({ message: "genreIds must be an array" });
      }
      await storage.setBookGenres(req.params.id as string, genreIds);
      const updatedGenres = await storage.getBookGenres(req.params.id as string);
      return res.json(updatedGenres);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARTNERS ROUTES ====================

  app.get("/api/partners", async (_req, res) => {
    try {
      const partnersList = await storage.getActivePartners();
      return res.json(partnersList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/partners", requireAdmin, async (_req, res) => {
    try {
      const partnersList = await storage.getAllPartners();
      return res.json(partnersList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/partners", requireAdmin, async (req, res) => {
    try {
      const parsed = insertPartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const partner = await storage.createPartner(parsed.data);
      return res.status(201).json(partner);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/partners/:id", requireAdmin, async (req, res) => {
    try {
      const partner = await storage.updatePartner(req.params.id as string, req.body);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      return res.json(partner);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/partners/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deletePartner(req.params.id as string);
      return res.json({ message: "Partner deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== CHALLENGES ROUTES ====================

  app.get("/api/challenges", async (_req, res) => {
    try {
      const challengesList = await storage.getActiveChallenges();
      return res.json(challengesList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/challenges", requireAdmin, async (_req, res) => {
    try {
      const challengesList = await storage.getAllChallenges();
      return res.json(challengesList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/challenges", requireAdmin, async (req, res) => {
    try {
      const body = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      const parsed = insertChallengeSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const challenge = await storage.createChallenge(parsed.data);
      return res.status(201).json(challenge);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/challenges/:id", requireAdmin, async (req, res) => {
    try {
      const body = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      const challenge = await storage.updateChallenge(req.params.id as string, body);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      return res.json(challenge);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/challenges/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteChallenge(req.params.id as string);
      return res.json({ message: "Challenge deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== ADMIN ROUTES ====================

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password, ...u }) => u);
      return res.json(usersWithoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/pending-teachers", requireAdmin, async (_req, res) => {
    try {
      const pendingTeachers = await storage.getPendingTeachers();
      const pendingSchoolAdmins = await storage.getPendingSchoolAdmins();
      const all = [...pendingTeachers, ...pendingSchoolAdmins];
      const withoutPasswords = all.map(({ password, ...u }) => u);
      return res.json(withoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/approve-teacher/:id", requireAdmin, async (req, res) => {
    try {
      const { maxStudentAccounts, maxTeacherAccounts } = req.body;
      const targetUser = await storage.getUser(req.params.id as string);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updateData: any = { approved: true };
      if (targetUser.role === "school_admin") {
        updateData.maxTeacherAccounts = maxTeacherAccounts || 10;
        updateData.maxStudentAccounts = maxStudentAccounts || 200;
      } else {
        updateData.maxStudentAccounts = maxStudentAccounts || 30;
      }
      const user = await storage.updateUser(req.params.id as string, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      const user = await storage.updateUser(req.params.id as string, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id as string);
      return res.json({ message: "User deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const [allUsers, allBooks, allQuizzes, allMessages] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllBooks(),
        storage.getAllQuizzes(),
        storage.getAllContactMessages(),
      ]);
      return res.json({
        totalUsers: allUsers.length,
        totalBooks: allBooks.length,
        totalQuizzes: allQuizzes.length,
        totalMessages: allMessages.length,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/book-audit", requireAdmin, async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");

      const totalResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books`);
      const totalBooks = Number(totalResult.rows[0].cnt);

      const noCoverResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE cover_image IS NULL OR cover_image = ''`);
      const uploadsCoverResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE cover_image LIKE '/uploads/%'`);
      const httpCoverResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE cover_image LIKE 'http%'`);
      const otherCoverResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE cover_image IS NOT NULL AND cover_image != '' AND cover_image NOT LIKE '/uploads/%' AND cover_image NOT LIKE 'http%'`);

      const uploadsBooks = await db.execute(sql`SELECT id, title, cover_image FROM books WHERE cover_image LIKE '/uploads/%'`);
      let coverFileExists = 0;
      let coverFileMissing = 0;
      const missingCovers: any[] = [];
      for (const b of uploadsBooks.rows as any[]) {
        const filePath = path.join(process.cwd(), b.cover_image);
        if (fs.existsSync(filePath)) {
          coverFileExists++;
        } else {
          coverFileMissing++;
          if (missingCovers.length < 50) {
            missingCovers.push({ id: b.id, title: b.title, coverImage: b.cover_image });
          }
        }
      }

      const noGenreResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books b WHERE NOT EXISTS (SELECT 1 FROM book_genres bg WHERE bg.book_id = b.id)`);
      const hasGenreResult = await db.execute(sql`SELECT COUNT(DISTINCT book_id) as cnt FROM book_genres`);

      const noGenreExamples = await db.execute(sql`SELECT id, title FROM books b WHERE NOT EXISTS (SELECT 1 FROM book_genres bg WHERE bg.book_id = b.id) LIMIT 20`);

      const quizResult = await db.execute(sql`SELECT COUNT(DISTINCT book_id) as cnt FROM quizzes`);
      const pdfResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE pdf_url IS NOT NULL AND pdf_url != ''`);

      const ageResult = await db.execute(sql`SELECT COALESCE(age_group, 'null') as ag, COUNT(*) as cnt FROM books GROUP BY age_group ORDER BY cnt DESC`);
      const noAgeResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE age_group IS NULL OR age_group = ''`);
      const noAgeExamples = await db.execute(sql`SELECT id, title FROM books WHERE age_group IS NULL OR age_group = '' LIMIT 20`);

      const noAuthorResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE author IS NULL OR author = ''`);
      const noDescResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM books WHERE description IS NULL OR description = ''`);

      return res.json({
        totalBooks,
        coverAnalysis: {
          noCover: Number(noCoverResult.rows[0].cnt),
          uploadsPath: Number(uploadsCoverResult.rows[0].cnt),
          httpUrl: Number(httpCoverResult.rows[0].cnt),
          otherNoPrefix: Number(otherCoverResult.rows[0].cnt),
          fileExists: coverFileExists,
          fileMissing: coverFileMissing,
          missingCoverExamples: missingCovers,
        },
        genreAnalysis: {
          booksWithGenres: Number(hasGenreResult.rows[0].cnt),
          booksWithoutGenres: Number(noGenreResult.rows[0].cnt),
          noGenreExamples: noGenreExamples.rows,
        },
        dataQuality: {
          noAuthor: Number(noAuthorResult.rows[0].cnt),
          noDescription: Number(noDescResult.rows[0].cnt),
          noAgeGroup: Number(noAgeResult.rows[0].cnt),
          noAgeGroupExamples: noAgeExamples.rows,
        },
        quizzes: {
          booksWithQuiz: Number(quizResult.rows[0].cnt),
          booksWithoutQuiz: totalBooks - Number(quizResult.rows[0].cnt),
        },
        pdfs: {
          booksWithPdf: Number(pdfResult.rows[0].cnt),
        },
        ageGroups: Object.fromEntries((ageResult.rows as any[]).map(r => [r.ag, Number(r.cnt)])),
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/missing-covers-csv", requireAdmin, async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");

      const uploadsBooks = await db.execute(sql`SELECT id, title, author, cover_image, age_group FROM books WHERE cover_image LIKE '/uploads/%' ORDER BY title`);
      const missing: any[] = [];
      for (const b of uploadsBooks.rows as any[]) {
        const filePath = path.join(process.cwd(), b.cover_image);
        if (!fs.existsSync(filePath)) {
          missing.push(b);
        }
      }

      const noCover = await db.execute(sql`SELECT id, title, author, age_group FROM books WHERE cover_image IS NULL OR cover_image = '' ORDER BY title`);

      const bom = "\uFEFF";
      const headers = "title;author;ageGroup;coverImage;status";
      const rows: string[] = [];
      for (const b of missing) {
        const filename = b.cover_image.replace('/uploads/covers/', '');
        rows.push([b.title, b.author, b.age_group || '', filename, 'fajl_nedostaje'].map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(';'));
      }
      for (const b of noCover.rows as any[]) {
        rows.push([b.title, b.author, b.age_group || '', '', 'nema_putanju'].map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(';'));
      }

      const csv = bom + headers + "\n" + rows.join("\n");
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="nedostajuce_naslovnice.csv"');
      return res.send(csv);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/fix-covers", requireAdmin, async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");

      const prefixResult = await db.execute(sql`
        UPDATE books 
        SET cover_image = '/uploads/covers/' || cover_image 
        WHERE cover_image IS NOT NULL 
        AND cover_image != '' 
        AND cover_image NOT LIKE '/uploads/%'
        AND cover_image NOT LIKE 'http%'
      `);
      const prefixFixed = prefixResult.rowCount ?? 0;

      return res.json({
        message: "Cover paths fixed",
        prefixFixed,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== TEACHER ROUTES ====================

  app.get("/api/teacher/students", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const teacher = await storage.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const createdStudents = await storage.getStudentsByTeacherId(teacherId);

      let classStudents: any[] = [];
      if (teacher.schoolName && teacher.className) {
        classStudents = await storage.getStudentsBySchoolAndClass(teacher.schoolName, teacher.className);
      }

      const allStudentIds = new Set<string>();
      const allStudents: any[] = [];
      for (const s of [...createdStudents, ...classStudents]) {
        if (!allStudentIds.has(s.id)) {
          allStudentIds.add(s.id);
          const { password, ...rest } = s;
          allStudents.push(rest);
        }
      }

      return res.json(allStudents);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/teacher/create-student", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const teacher = await storage.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (teacher.institutionType && teacher.approved !== true) {
        return res.status(403).json({ message: "Vaš račun nije odobren." });
      }

      const currentStudents = await storage.getStudentsByTeacherId(teacherId);
      if (teacher.maxStudentAccounts && currentStudents.length >= teacher.maxStudentAccounts) {
        return res.status(400).json({ message: `Dostigli ste maksimalan broj učeničkih računa (${teacher.maxStudentAccounts}).` });
      }

      const { fullName } = req.body;
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: "Ime i prezime je obavezno." });
      }

      let username = generateUsername(fullName);
      let attempts = 0;
      while (await storage.getUserByUsername(username) && attempts < 10) {
        username = generateUsername(fullName);
        attempts++;
      }

      const plainPassword = generatePassword();
      const hashedPw = await hashPassword(plainPassword);

      const student = await storage.createUser({
        username,
        email: `${username}@citaj.ba`,
        password: hashedPw,
        role: "student",
        fullName: fullName.trim(),
        schoolName: teacher.schoolName,
        className: teacher.className,
        createdByTeacherId: teacherId,
      });

      const { password, ...studentData } = student;
      return res.status(201).json({ ...studentData, generatedPassword: plainPassword });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/teacher/reset-student-password", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const { studentId } = req.body;
      if (!studentId) {
        return res.status(400).json({ message: "ID učenika je obavezan." });
      }

      const student = await storage.getUser(studentId);
      if (!student || student.createdByTeacherId !== teacherId) {
        return res.status(403).json({ message: "Nemate pristup ovom učeniku." });
      }

      const newPassword = generatePassword();
      const hashedPw = await hashPassword(newPassword);
      await storage.updateUser(studentId, { password: hashedPw } as any);

      return res.json({ username: student.username, fullName: student.fullName, newPassword });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/teacher/update-student/:studentId", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const studentId = req.params.studentId as string;
      const student = await storage.getUser(studentId);
      if (!student || student.createdByTeacherId !== teacherId) {
        return res.status(403).json({ message: "Nemate pristup ovom učeniku." });
      }

      const { fullName } = req.body;
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: "Ime i prezime mora imati najmanje 2 karaktera." });
      }

      const updated = await storage.updateUser(studentId, { fullName: fullName.trim() } as any);
      if (!updated) {
        return res.status(404).json({ message: "Učenik nije pronađen." });
      }

      const { password: _, ...withoutPassword } = updated;
      return res.json(withoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/teacher/delete-student/:studentId", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const studentId = req.params.studentId as string;
      const student = await storage.getUser(studentId);
      if (!student || student.createdByTeacherId !== teacherId) {
        return res.status(403).json({ message: "Nemate pristup ovom učeniku." });
      }

      await storage.deleteQuizResultsByUserId(studentId);
      await storage.deleteUser(studentId);
      return res.json({ message: "Učenik uspješno obrisan." });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/teacher/create-students-bulk", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const teacher = await storage.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (teacher.institutionType && teacher.approved !== true) {
        return res.status(403).json({ message: "Vaš račun nije odobren." });
      }

      const { students: studentNames } = req.body;
      if (!Array.isArray(studentNames) || studentNames.length === 0) {
        return res.status(400).json({ message: "Lista učenika je obavezna." });
      }

      const validNames = studentNames.filter((n: string) => n && n.trim().length >= 2);
      if (validNames.length === 0) {
        return res.status(400).json({ message: "Nema validnih imena učenika." });
      }

      const currentStudents = await storage.getStudentsByTeacherId(teacherId);
      if (teacher.maxStudentAccounts && currentStudents.length + validNames.length > teacher.maxStudentAccounts) {
        return res.status(400).json({
          message: `Možete dodati još ${teacher.maxStudentAccounts - currentStudents.length} učenika (limit: ${teacher.maxStudentAccounts}).`,
        });
      }

      const results = [];
      for (const fullName of validNames) {
        let username = generateUsername(fullName.trim());
        let attempts = 0;
        while (await storage.getUserByUsername(username) && attempts < 10) {
          username = generateUsername(fullName.trim());
          attempts++;
        }

        const plainPassword = generatePassword();
        const hashedPw = await hashPassword(plainPassword);

        const student = await storage.createUser({
          username,
          email: `${username}@citaj.ba`,
          password: hashedPw,
          role: "student",
          fullName: fullName.trim(),
          schoolName: teacher.schoolName,
          className: teacher.className,
          createdByTeacherId: teacherId,
        });

        const { password, ...studentData } = student;
        results.push({ ...studentData, generatedPassword: plainPassword });
      }

      return res.status(201).json(results);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/export", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const students = await storage.getStudentsByTeacherId(teacherId);

      let csv = "Ime i prezime,Korisničko ime,Škola,Razred,Bodovi\n";
      for (const s of students) {
        csv += `"${s.fullName}","${s.username}","${s.schoolName || ""}","${s.className || ""}",${s.points}\n`;
      }

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=ucenici.csv");
      return res.send("\uFEFF" + csv);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARENT ROUTES ====================

  app.get("/api/parent/children", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }
      const children = await storage.getChildrenByParentId(req.session.userId!);
      const childrenWithoutPasswords = children.map(({ password, ...c }) => c);
      return res.json(childrenWithoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== CSV TEMPLATE & IMPORT ROUTES ====================

  app.get("/api/admin/templates/books", requireAdmin, (_req, res) => {
    const headers = "title;author;description;coverImage;content;ageGroup;genre;readingDifficulty;pageCount;pdfUrl;purchaseUrl;weeklyPick;publisher;publicationYear;publicationCity;isbn;cobissId;language;bookFormat";
    const exampleRows = [
      '"Mali princ";"Antoine de Saint-Exupéry";"Priča o malom princu koji putuje po planetama";"https://example.com/cover.jpg";"Sadržaj knjige...";"R4";"avantura_fantasy, lektira";"lako";"96";"";"";"ne";"Svjetlost";"2023";"Sarajevo";"9789958111234";"123456";"bosanski";"meki uvez"',
      '"Ježeva kućica";"Branko Ćopić";"Priča o ježevoj kućici";"https://example.com/jez.jpg";"Sadržaj...";"R1";"bajke_basne, lektira";"lako";"48";"";"";"ne";"Veselin Masleša";"2020";"Sarajevo";"";"";"";"tvrdi uvez"',
      '"Tvrđava";"Meša Selimović";"Roman o derviš Ahmetu Nurudinu";"https://example.com/tvrdjava.jpg";"Sadržaj...";"A";"beletristika, roman, klasici";"tesko";"432";"";"";"ne";"Svjetlost";"2019";"Sarajevo";"9789958101234";"";"bosanski";""',
    ];
    const csv = headers + "\n" + exampleRows.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=knjige_template.csv");
    return res.send("\uFEFF" + csv);
  });

  app.get("/api/admin/templates/quizzes", requireAdmin, (_req, res) => {
    // Napomena: bodovi se automatski određuju prema starosnoj skupini knjige (R1=1, R4=3, R7=5, O=7, A=10)
    // Format: bookTitle;questionText;optionA;optionB;optionC;optionD;correctAnswer
    // correctAnswer: a, b, c ili d
    // Separator: ; (tačka-zarez)
    // Ako kviz za knjigu već postoji, pitanja se dodaju na postojeći kviz
    const headers = "bookTitle;questionText;optionA;optionB;optionC;optionD;correctAnswer";
    const lines = [
      headers,
      '"Mali princ";"Koji cvijet je rastao na planeti malog princa?";"Ruža";"Tulipan";"Ljiljan";"Narcis";"a"',
      '"Mali princ";"Koliko planeta je posjetio mali princ?";"5";"6";"7";"8";"c"',
      '"Mali princ";"Od čega je bila načinjena kapa malog princa?";"Slona kojeg je progutala boa";"Slame";"Kože";"Papira";"a"',
      '"Ježeva kućica";"Ko je napisao Ježevu kućicu?";"Branko Ćopić";"Ivo Andrić";"Meša Selimović";"Petar Kočić";"a"',
      '"Ježeva kućica";"Gdje je jež živio?";"U šumi";"Na livadi";"U bašti";"Na planini";"a"',
      '"Ježeva kućica";"Kako se zove ježeva prijateljica?";"Lisica";"Vjeverica";"Zečica";"Medvjedica";"b"',
    ];
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=kvizovi_template.csv");
    return res.send("\uFEFF" + csv);
  });

  app.post("/api/admin/import/books", requireAdmin, uploadCSV.single("csv"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "CSV datoteka je obavezna" });
      const content = fs.readFileSync(req.file.path, "utf-8");
      const rows = parseCSV(content);
      if (rows.length === 0) return res.status(400).json({ message: "CSV je prazan ili neispravan format" });

      const created: string[] = [];
      const skipped: string[] = [];
      const updatedCovers: string[] = [];
      const errors: string[] = [];

      const existingBooks = await storage.getAllBooks();
      function normalizeForMatch(text: string): string {
        return text.toLowerCase()
          .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
          .replace(/ž/g, "z").replace(/đ/g, "dj")
          .replace(/[^a-z0-9]/g, "")
          .trim();
      }
      function authorLastName(name: string): string {
        const parts = normalizeForMatch(name).replace(/[^a-z ]/g, "").trim().split(/\s+/);
        return parts[parts.length - 1] || "";
      }
      function areSimilarAuthors(a: string, b: string): boolean {
        const na = normalizeForMatch(a);
        const nb = normalizeForMatch(b);
        if (na === nb) return true;
        if (na.includes(nb) || nb.includes(na)) return true;
        const lastA = authorLastName(a);
        const lastB = authorLastName(b);
        if (lastA.length >= 3 && lastB.length >= 3) {
          if (lastA === lastB) return true;
          let common = 0;
          for (const ch of lastA) { if (lastB.includes(ch)) common++; }
          if (common / Math.max(lastA.length, lastB.length) >= 0.75) return true;
        }
        return false;
      }
      function findExistingBook(title: string, author: string): (typeof existingBooks)[0] | undefined {
        const normTitle = normalizeForMatch(title);
        const normAuthor = normalizeForMatch(author);
        return existingBooks.find(b => {
          const bt = normalizeForMatch(b.title);
          const ba = normalizeForMatch(b.author);
          if (bt === normTitle && ba === normAuthor) return true;
          if (bt === normTitle && areSimilarAuthors(author, b.author)) return true;
          if (normTitle.length > 5 && bt.includes(normTitle) && ba === normAuthor) return true;
          return false;
        });
      }
      const existingMap = new Map(existingBooks.map(b => [`${b.title.toLowerCase()}::${b.author.toLowerCase()}`, b]));
      const csvSeenKeys = new Set<string>();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          if (!row.title || !row.author) {
            errors.push(`Red ${i + 2}: Naslov i autor su obavezni`);
            continue;
          }
          const csvKey = normalizeForMatch(row.title) + "::" + normalizeForMatch(row.author);
          if (csvSeenKeys.has(csvKey)) {
            skipped.push(`${row.title} (duplikat u CSV-u)`);
            continue;
          }
          csvSeenKeys.add(csvKey);
          const key = `${row.title.toLowerCase()}::${row.author.toLowerCase()}`;
          const existingBook = existingMap.get(key) || findExistingBook(row.title, row.author);
          if (existingBook) {
            if (row.coverImage && row.coverImage.trim() && row.coverImage !== existingBook.coverImage) {
              const newCover = row.coverImage.trim();
              const hasLocalCover = existingBook.coverImage?.startsWith('/uploads/covers/');
              const isFakeCover = newCover.includes('buybook.ba') || newCover.includes('Buybook_Footer') || newCover.includes('placeholder');
              if (!isFakeCover && !hasLocalCover) {
                let finalCover = newCover;
                if (newCover.startsWith('http')) {
                  const localPath = await downloadImageToLocal(newCover, row.title);
                  if (localPath) {
                    finalCover = localPath;
                  }
                }
                await storage.updateBook(existingBook.id, { coverImage: finalCover });
                updatedCovers.push(row.title);
              }
            }
            const fillUpdates: Record<string, any> = {};
            if (row.description && row.description.trim() && (!existingBook.description || existingBook.description === "Opis nedostaje" || existingBook.description.trim() === "")) {
              fillUpdates.description = row.description.trim();
              fillUpdates.content = row.description.trim();
            }
            if (row.isbn && row.isbn.trim() && !existingBook.isbn) fillUpdates.isbn = row.isbn.trim();
            if (row.publisher && row.publisher.trim() && !existingBook.publisher) fillUpdates.publisher = row.publisher.trim();
            if (row.publicationYear && !existingBook.publicationYear) fillUpdates.publicationYear = parseInt(row.publicationYear);
            if (row.pageCount && parseInt(row.pageCount) > 0 && (!existingBook.pageCount || existingBook.pageCount <= 1)) fillUpdates.pageCount = parseInt(row.pageCount);
            if (row.language && row.language.trim() && (!existingBook.language || existingBook.language === "bosanski")) fillUpdates.language = row.language.trim();
            if (row.pdfUrl && row.pdfUrl.trim() && !existingBook.pdfUrl) fillUpdates.pdfUrl = row.pdfUrl.trim();
            if (row.purchaseUrl && row.purchaseUrl.trim() && !existingBook.purchaseUrl) fillUpdates.purchaseUrl = row.purchaseUrl.trim();
            if (Object.keys(fillUpdates).length > 0) {
              await storage.updateBook(existingBook.id, fillUpdates);
            }
            if (row.genre && row.genre.trim()) {
              const genreMapExisting: Record<string, string> = {
                "lektira": "lektira", "avantura i fantasy": "avantura_fantasy", "avantura": "avantura_fantasy",
                "roman": "roman", "beletristika": "beletristika", "bajke i basne": "bajke_basne",
                "bajke": "bajke_basne", "zanimljiva nauka": "zanimljiva_nauka", "poezija": "poezija", "islam": "islam",
                "klasici": "klasici", "fantasy": "avantura_fantasy", "fantazija": "avantura_fantasy",
                "biografija": "biografija", "historija": "historija", "drama": "drama",
              };
              const existGenreSlugs = row.genre.split(",").map((g: string) => {
                const trimmed = g.trim().toLowerCase();
                return genreMapExisting[trimmed] || trimmed;
              }).filter(Boolean);
              const allGenres = await storage.getAllGenres();
              const existGenreIds = existGenreSlugs.map((slug: string) => {
                const genre = allGenres.find(g => g.slug === slug);
                return genre?.id;
              }).filter(Boolean) as string[];
              if (existGenreIds.length > 0 && existingBook.id) {
                const currentGenres = await storage.getBookGenres(existingBook.id);
                const currentIds = currentGenres.map(g => g.id);
                const merged = [...new Set([...currentIds, ...existGenreIds])];
                await storage.setBookGenres(existingBook.id, merged);
              }
            }
            const updated = updatedCovers.includes(row.title) || Object.keys(fillUpdates).length > 0;
            if (!updated) {
              skipped.push(row.title);
            } else if (!updatedCovers.includes(row.title)) {
              skipped.push(`${row.title} (ažurirano)`);
            }
            continue;
          }
          existingMap.set(key, {} as any);
          const ageGroupMap: Record<string, string> = {
            "od 1. razreda": "R1", "r1": "R1",
            "od 4. razreda": "R4", "r4": "R4",
            "od 7. razreda": "R7", "r7": "R7",
            "omladina": "O", "o": "O",
            "odrasli": "A", "a": "A",
          };
          const rawAge = (row.ageGroup || "").trim().toLowerCase();
          const mappedAge = ageGroupMap[rawAge] || row.ageGroup || "R1";

          const genreMap: Record<string, string> = {
            "lektira": "lektira", "avantura i fantasy": "avantura_fantasy", "avantura": "avantura_fantasy",
            "roman": "roman", "beletristika": "beletristika", "bajke i basne": "bajke_basne",
            "bajke": "bajke_basne", "zanimljiva nauka": "zanimljiva_nauka", "poezija": "poezija", "islam": "islam",
            "klasici": "klasici", "fantasy": "avantura_fantasy", "fantazija": "avantura_fantasy",
            "biografija": "biografija", "historija": "historija", "drama": "drama",
          };
          const rawGenreField = (row.genre || "").trim();
          const genreSlugs = rawGenreField.split(",").map(g => {
            const trimmed = g.trim().toLowerCase();
            return genreMap[trimmed] || trimmed || "lektira";
          }).filter(Boolean);
          const primaryGenre = genreSlugs[0] || "lektira";

          let csvCoverImage = row.coverImage || "";
          if (csvCoverImage && csvCoverImage.startsWith('http') && !csvCoverImage.includes('buybook.ba') && !csvCoverImage.includes('placeholder')) {
            const localCover = await downloadImageToLocal(csvCoverImage, row.title);
            if (localCover) csvCoverImage = localCover;
          }
          if (!csvCoverImage || csvCoverImage.includes('placeholder') || csvCoverImage.includes('buybook.ba')) {
            csvCoverImage = "";
          }

          const newBook = await storage.createBook({
            title: row.title,
            author: row.author,
            description: row.description || "",
            coverImage: csvCoverImage,
            content: row.content || row.description || "",
            ageGroup: mappedAge,
            genre: primaryGenre,
            readingDifficulty: (row.readingDifficulty as "lako" | "srednje" | "tesko") || "srednje",
            pageCount: parseInt(row.pageCount) || 100,
            pdfUrl: row.pdfUrl || null,
            purchaseUrl: row.purchaseUrl || null,
            weeklyPick: row.weeklyPick === "true" || row.weeklyPick === "1" || row.weeklyPick === "da",
            publisher: row.publisher || null,
            publicationYear: row.publicationYear ? parseInt(row.publicationYear) : null,
            publicationCity: row.publicationCity || null,
            isbn: row.isbn || null,
            cobissId: row.cobissId || null,
            language: row.language || "bosanski",
            bookFormat: row.bookFormat || null,
          });

          if (genreSlugs.length > 0) {
            const allGenres = await storage.getAllGenres();
            const genreIds = genreSlugs.map(slug => {
              const genre = allGenres.find(g => g.slug === slug);
              return genre?.id;
            }).filter(Boolean) as string[];
            if (genreIds.length > 0) {
              await storage.setBookGenres(newBook.id, genreIds);
            }
          }
          created.push(row.title);
        } catch (err: any) {
          errors.push(`Red ${i + 2} (${row.title}): ${err.message}`);
        }
      }

      fs.unlinkSync(req.file.path);
      return res.json({ imported: created.length, skipped: skipped.length, skippedTitles: skipped, updatedCovers: updatedCovers.length, updatedCoverTitles: updatedCovers, errors, titles: created });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/template/covers", requireAdmin, (_req, res) => {
    const headers = "title,author,coverImage";
    const example = '"Mali princ","Antoine de Saint-Exupéry","https://example.com/mali-princ.jpg"';
    const csv = headers + "\n" + example;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=korice_template.csv");
    return res.send("\uFEFF" + csv);
  });

  app.post("/api/admin/import/covers", requireAdmin, uploadCSV.single("csv"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "CSV datoteka je obavezna" });
      const content = fs.readFileSync(req.file.path, "utf-8");
      const rows = parseCSV(content);
      if (rows.length === 0) return res.status(400).json({ message: "CSV je prazan ili neispravan format" });

      const existingBooks = await storage.getAllBooks();
      const booksByKey = new Map<string, typeof existingBooks[0]>();
      for (const b of existingBooks) {
        booksByKey.set(`${b.title.toLowerCase()}::${b.author.toLowerCase()}`, b);
        booksByKey.set(b.title.toLowerCase(), b);
      }

      const updated: string[] = [];
      const notFound: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          if (!row.title || !row.coverImage) {
            errors.push(`Red ${i + 2}: Naslov i coverImage su obavezni`);
            continue;
          }
          const key = row.author
            ? `${row.title.toLowerCase()}::${row.author.toLowerCase()}`
            : row.title.toLowerCase();
          const book = booksByKey.get(key);
          if (!book) {
            notFound.push(row.title);
            continue;
          }
          await storage.updateBook(book.id, { coverImage: row.coverImage });
          updated.push(row.title);
        } catch (err: any) {
          errors.push(`Red ${i + 2} (${row.title}): ${err.message}`);
        }
      }

      fs.unlinkSync(req.file.path);
      return res.json({ updated: updated.length, notFound: notFound.length, notFoundTitles: notFound, errors, titles: updated });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/import/quizzes", requireAdmin, uploadCSV.single("csv"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "CSV datoteka je obavezna" });
      const content = fs.readFileSync(req.file.path, "utf-8");
      const rows = parseCSV(content);
      if (rows.length === 0) return res.status(400).json({ message: "CSV je prazan ili neispravan format" });

      const allBooks = await storage.getAllBooks();
      const bookQuestionsMap = new Map<string, { bookId: string; bookTitle: string; questions: Array<{ questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string }> }>();
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const book = allBooks.find(b => b.title.toLowerCase() === (row.bookTitle || "").toLowerCase());
        if (!book) {
          errors.push(`Red ${i + 2}: Knjiga "${row.bookTitle}" nije pronađena`);
          continue;
        }
        if (!row.questionText) {
          errors.push(`Red ${i + 2}: Tekst pitanja je obavezan`);
          continue;
        }

        if (!bookQuestionsMap.has(book.id)) {
          bookQuestionsMap.set(book.id, { bookId: book.id, bookTitle: book.title, questions: [] });
        }
        const validAnswers = ["a", "b", "c", "d"];
        const correctAnswer = validAnswers.includes((row.correctAnswer || "").toLowerCase()) ? row.correctAnswer.toLowerCase() : "a";
        bookQuestionsMap.get(book.id)!.questions.push({
          questionText: row.questionText,
          optionA: row.optionA || "",
          optionB: row.optionB || "",
          optionC: row.optionC || "",
          optionD: row.optionD || "",
          correctAnswer,
        });
      }

      let quizzesCreated = 0;
      let questionsAdded = 0;

      for (const data of bookQuestionsMap.values()) {
        try {
          const existingQuizzes = await storage.getQuizzesByBookId(data.bookId);
          let quiz;
          if (existingQuizzes.length > 0) {
            quiz = existingQuizzes[0];
          } else {
            quiz = await storage.createQuiz({ bookId: data.bookId, title: data.bookTitle, quizAuthor: "Čitanje.ba" });
            quizzesCreated++;
          }
          for (const q of data.questions) {
            await storage.createQuestion({
              quizId: quiz.id,
              questionText: q.questionText,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer as "a" | "b" | "c" | "d",
              points: 1,
            });
            questionsAdded++;
          }
        } catch (err: any) {
          errors.push(`Knjiga "${data.bookTitle}": ${err.message}`);
        }
      }

      fs.unlinkSync(req.file.path);
      return res.json({ quizzesCreated, questionsAdded, errors });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BONUS POINTS ====================

  app.post("/api/teacher/bonus-points", requireTeacher, async (req, res) => {
    try {
      const { studentId, points, reason } = req.body;

      if (!studentId || !points || !reason) {
        return res.status(400).json({ message: "Sva polja su obavezna" });
      }

      const student = await storage.getUser(studentId);
      if (!student || student.createdByTeacherId !== req.session.userId) {
        return res.status(403).json({ message: "Nemate pristup ovom učeniku" });
      }

      const bonusPoint = await storage.createBonusPoints({
        studentId,
        teacherId: req.session.userId,
        points,
        reason,
      });

      await storage.updateUser(studentId, {
        points: (student.points || 0) + points,
      } as any);

      res.json(bonusPoint);
    } catch (error) {
      console.error("Error adding bonus points:", error);
      res.status(500).json({ message: "Greška pri dodavanju bonus bodova" });
    }
  });

  // ==================== BOOK RECOMMENDATIONS ====================

  app.post("/api/recommend-book", requireAuth, async (req, res) => {
    try {
      const { toUserId, bookId, message, priority } = req.body;

      if (!toUserId || !bookId) {
        return res.status(400).json({ message: "Nedostaju obavezna polja" });
      }

      const fromUser = await storage.getUser(req.session.userId!);
      if (!fromUser) return res.status(401).json({ message: "Korisnik nije pronađen" });

      const toUser = await storage.getUser(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "Korisnik nije pronađen" });
      }

      const canRecommend =
        (fromUser.role === "teacher" && toUser.createdByTeacherId === fromUser.id) ||
        (fromUser.role === "parent" && toUser.parentId === fromUser.id);

      if (!canRecommend) {
        return res.status(403).json({ message: "Nemate dozvolu da preporučite ovom korisniku" });
      }

      const recommendation = await storage.createBookRecommendation({
        fromUserId: fromUser.id,
        toUserId,
        bookId,
        message: message || "Preporučujem ti ovu knjigu!",
        priority: priority || "normal",
      });

      res.json(recommendation);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      res.status(500).json({ message: "Greška pri kreiranju preporuke" });
    }
  });

  app.get("/api/recommendations/my", requireAuth, async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsForUser(req.session.userId!);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Greška pri preuzimanju preporuka" });
    }
  });

  // ==================== CLASS CHALLENGES ====================

  app.post("/api/teacher/class-challenge", requireTeacher, async (req, res) => {
    try {
      const { className, bookId, challengeType, startDate, endDate, bonusPoints, description } = req.body;

      const challenge = await storage.createClassChallenge({
        teacherId: req.session.userId,
        className,
        bookId,
        challengeType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bonusPoints: bonusPoints || 10,
        description,
        active: true,
      });

      res.json(challenge);
    } catch (error) {
      console.error("Error creating class challenge:", error);
      res.status(500).json({ message: "Greška pri kreiranju izazova" });
    }
  });

  app.get("/api/class-challenges/:className", requireAuth, async (req, res) => {
    try {
      const className = req.params.className as string;
      const challenges = await storage.getActiveChallengesForClass(className);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Greška pri preuzimanju izazova" });
    }
  });

  // ==================== INACTIVE STUDENTS ====================

  app.get("/api/teacher/inactive-students", requireTeacher, async (req, res) => {
    try {
      const students = await storage.getStudentsByTeacherId(req.session.userId!);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const inactiveStudents = [];

      for (const student of students) {
        const lastActivity = await storage.getLastQuizResultForUser(student.id);

        if (!lastActivity || new Date(lastActivity.completedAt) < sevenDaysAgo) {
          inactiveStudents.push({
            ...student,
            lastActivity: lastActivity?.completedAt || null,
          });
        }
      }

      res.json(inactiveStudents);
    } catch (error) {
      console.error("Error fetching inactive students:", error);
      res.status(500).json({ message: "Greška pri preuzimanju neaktivnih učenika" });
    }
  });

  app.get("/api/teacher/class-stats", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const teacher = await storage.getUser(teacherId);
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });

      const createdStudents = await storage.getStudentsByTeacherId(teacherId);
      let classStudents: any[] = [];
      if (teacher.schoolName && teacher.className) {
        classStudents = await storage.getStudentsBySchoolAndClass(teacher.schoolName, teacher.className);
      }
      const allStudentIds = new Set<string>();
      const students: any[] = [];
      for (const s of [...createdStudents, ...classStudents]) {
        if (!allStudentIds.has(s.id)) {
          allStudentIds.add(s.id);
          students.push(s);
        }
      }

      const allQuizzes = await storage.getAllQuizzes();
      const allBooks = await storage.getAllBooks();

      const studentStats = [];
      for (const s of students) {
        const results = await storage.getQuizResultsByUserId(s.id);
        studentStats.push({
          id: s.id,
          fullName: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.username,
          points: s.points || 0,
          booksRead: s.booksRead || 0,
          quizzesTaken: results.length,
          avgScore: results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + (r.totalQuestions > 0 ? (r.correctAnswers / r.totalQuestions) * 100 : 0), 0) / results.length)
            : 0,
        });
      }

      const genreCount: Record<string, number> = {};
      for (const s of students) {
        const results = await storage.getQuizResultsByUserId(s.id);
        for (const r of results) {
          const quiz = allQuizzes.find(q => q.id === r.quizId);
          if (quiz) {
            const book = allBooks.find(b => b.id === quiz.bookId);
            if (book) {
              const genre = book.genre || "Ostalo";
              genreCount[genre] = (genreCount[genre] || 0) + 1;
            }
          }
        }
      }
      const genreDistribution = Object.entries(genreCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

      res.json({ studentStats, genreDistribution });
    } catch (error: any) {
      console.error("Error fetching class stats:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== SCHOOL DASHBOARD ====================

  app.get("/api/school/stats", requireAuth, async (req, res) => {
    try {
      const userRole = req.session.userRole;
      if (userRole !== "school" && userRole !== "school_admin" && userRole !== "admin") {
        return res.status(403).json({ message: "Pristup odbijen" });
      }
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.schoolName) {
        return res.status(403).json({ message: "Pristup odbijen" });
      }

      const allSchoolUsers = await storage.getUsersBySchoolName(user.schoolName);
      const students = allSchoolUsers.filter((u) => u.role === "student");
      const teachers = allSchoolUsers.filter((u) => u.role === "teacher");

      const totalStudents = students.length;
      const totalTeachers = teachers.length;
      const totalPoints = students.reduce((sum, s) => sum + s.points, 0);
      const avgPoints = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;

      let totalQuizzes = 0;
      const studentQuizCounts: Record<string, number> = {};
      for (const s of students) {
        const count = await storage.getQuizResultsCountByUserId(s.id);
        studentQuizCounts[s.id] = count;
        totalQuizzes += count;
      }

      const classCounts: Record<string, { students: number; points: number; quizzes: number }> = {};
      for (const s of students) {
        const cls = s.className || "Bez razreda";
        if (!classCounts[cls]) classCounts[cls] = { students: 0, points: 0, quizzes: 0 };
        classCounts[cls].students++;
        classCounts[cls].points += s.points;
        classCounts[cls].quizzes += studentQuizCounts[s.id] || 0;
      }

      const classes = Object.entries(classCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.points - a.points);

      const topStudents = [...students]
        .sort((a, b) => b.points - a.points)
        .slice(0, 10)
        .map((s) => ({
          id: s.id,
          fullName: s.fullName,
          className: s.className,
          points: s.points,
          quizzes: studentQuizCounts[s.id] || 0,
        }));

      const teacherList = teachers.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        className: t.className,
        studentCount: students.filter((s) => s.createdByTeacherId === t.id || s.className === t.className).length,
      }));

      res.json({
        schoolName: user.schoolName,
        totalStudents,
        totalTeachers,
        totalPoints,
        totalQuizzes,
        avgPoints,
        classes,
        topStudents,
        teachers: teacherList,
      });
    } catch (error) {
      console.error("Error fetching school stats:", error);
      res.status(500).json({ message: "Greška pri preuzimanju statistike" });
    }
  });

  // ==================== PARENT-CHILD LINKING ====================

  app.post("/api/parent/link-child", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Samo roditelji mogu slati zahtjeve" });
      }
      const { studentUsername } = req.body;
      if (!studentUsername) {
        return res.status(400).json({ message: "Unesite korisničko ime učenika" });
      }

      const student = await storage.getUserByUsername(studentUsername);
      if (!student || student.role !== "student") {
        return res.status(404).json({ message: "Učenik sa tim korisničkim imenom nije pronađen" });
      }

      if (!student.createdByTeacherId) {
        return res.status(400).json({ message: "Ovaj učenik nema dodijeljenog učitelja" });
      }

      const existing = await storage.getPendingParentRequestForStudent(req.session.userId!, student.id);
      if (existing) {
        return res.status(400).json({ message: "Već ste poslali zahtjev za ovog učenika" });
      }

      if (student.parentId === req.session.userId) {
        return res.status(400).json({ message: "Ovaj učenik je već povezan s vašim računom" });
      }

      const request = await storage.createParentChildRequest({
        parentId: req.session.userId!,
        studentId: student.id,
        teacherId: student.createdByTeacherId,
        status: "pending",
      });

      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/parent/link-requests", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Pristup odbijen" });
      }
      const requests = await storage.getParentChildRequestsByParentId(req.session.userId!);
      const enriched = [];
      for (const r of requests) {
        const student = await storage.getUser(r.studentId);
        enriched.push({
          ...r,
          studentName: student?.fullName || "Nepoznato",
          studentUsername: student?.username || "",
        });
      }
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/parent-requests", requireTeacher, async (req, res) => {
    try {
      const requests = await storage.getParentChildRequestsByTeacherId(req.session.userId!);
      const enriched = [];
      for (const r of requests) {
        const parent = await storage.getUser(r.parentId);
        const student = await storage.getUser(r.studentId);
        enriched.push({
          ...r,
          parentName: parent?.fullName || "Nepoznato",
          parentEmail: parent?.email || "",
          studentName: student?.fullName || "Nepoznato",
          studentUsername: student?.username || "",
        });
      }
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/teacher/parent-request/:requestId", requireTeacher, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Nevažeći status" });
      }
      const request = await storage.getParentChildRequest(req.params.requestId as string);
      if (!request || request.teacherId !== req.session.userId) {
        return res.status(404).json({ message: "Zahtjev nije pronađen" });
      }

      if (status === "approved") {
        await storage.updateUser(request.studentId, { parentId: request.parentId } as any);
      }

      const updated = await storage.updateParentChildRequestStatus(request.id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARENT: CREATE FAMILY ACCOUNTS ====================

  app.post("/api/parent/create-child", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Samo roditelji mogu kreirati dječije račune" });
      }
      const parentId = req.session.userId!;
      const parent = await storage.getUser(parentId);
      if (!parent) return res.status(404).json({ message: "Korisnik nije pronađen" });

      const existingChildren = await storage.getChildrenByParentId(parentId);
      const childCount = existingChildren.filter(c => c.role === "student").length;
      if (childCount >= 3) {
        return res.status(400).json({ message: "Možete kreirati najviše 3 dječija računa." });
      }

      const { fullName, ageGroup } = req.body;
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: "Ime i prezime je obavezno (min. 2 karaktera)." });
      }

      let username = generateUsername(fullName);
      let attempts = 0;
      while (await storage.getUserByUsername(username) && attempts < 10) {
        username = generateUsername(fullName);
        attempts++;
      }

      const plainPassword = generatePassword();
      const hashedPw = await hashPassword(plainPassword);

      const child = await storage.createUser({
        username,
        email: `${username}@family.citaj.ba`,
        password: hashedPw,
        role: "student",
        fullName: fullName.trim(),
        ageGroup: ageGroup || "R1",
        parentId,
      });

      const { password, ...childData } = child;
      return res.status(201).json({ ...childData, generatedPassword: plainPassword });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/parent/create-reader", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Samo roditelji mogu kreirati Čitalac Pro račune" });
      }
      const parentId = req.session.userId!;
      const parent = await storage.getUser(parentId);
      if (!parent) return res.status(404).json({ message: "Korisnik nije pronađen" });

      const existingChildren = await storage.getChildrenByParentId(parentId);
      const readerCount = existingChildren.filter(c => c.role === "reader").length;
      if (readerCount >= 1) {
        return res.status(400).json({ message: "Možete kreirati najviše 1 Čitalac Pro račun." });
      }

      const { fullName } = req.body;
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: "Ime i prezime je obavezno (min. 2 karaktera)." });
      }

      let username = generateUsername(fullName);
      let attempts = 0;
      while (await storage.getUserByUsername(username) && attempts < 10) {
        username = generateUsername(fullName);
        attempts++;
      }

      const plainPassword = generatePassword();
      const hashedPw = await hashPassword(plainPassword);

      const reader = await storage.createUser({
        username,
        email: `${username}@family.citaj.ba`,
        password: hashedPw,
        role: "reader",
        fullName: fullName.trim(),
        ageGroup: "A",
        parentId,
        subscriptionType: "standard",
      });

      const { password, ...readerData } = reader;
      return res.status(201).json({ ...readerData, generatedPassword: plainPassword });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/parent/family-members", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Pristup odbijen" });
      }
      const members = await storage.getChildrenByParentId(req.session.userId!);
      const withoutPasswords = members.map(({ password, ...u }) => u);
      res.json(withoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reader/family-children", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "reader") {
        return res.status(403).json({ message: "Pristup odbijen" });
      }
      const reader = await storage.getUser(req.session.userId!);
      if (!reader || !reader.parentId) {
        return res.json([]);
      }
      const allMembers = await storage.getChildrenByParentId(reader.parentId);
      const children = allMembers.filter(m => m.role === "student");
      const withoutPasswords = children.map(({ password, ...u }) => u);
      res.json(withoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== SCHOOL ADMIN: MANAGE TEACHERS ====================

  app.get("/api/school-admin/teachers", requireSchoolAdmin, async (req, res) => {
    try {
      const teachers = await storage.getTeachersBySchoolAdminId(req.session.userId!);
      const withoutPasswords = teachers.map(({ password, ...u }) => u);
      res.json(withoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/school-admin/create-teacher", requireSchoolAdmin, async (req, res) => {
    try {
      const admin = await storage.getUser(req.session.userId!);
      if (!admin) return res.status(403).json({ message: "Pristup odbijen" });

      const existingTeachers = await storage.getTeachersBySchoolAdminId(admin.id);
      if (existingTeachers.length >= (admin.maxTeacherAccounts || 10)) {
        return res.status(400).json({ message: `Dostigli ste maksimalan broj učiteljskih računa (${admin.maxTeacherAccounts || 10})` });
      }

      const { username, password, fullName, email, className } = req.body;
      if (!username || !password || !fullName) {
        return res.status(400).json({ message: "Korisničko ime, lozinka i puno ime su obavezni" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Korisničko ime je zauzeto" });
      }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ message: passwordCheck.message });
      }

      const hashedPassword = await hashPassword(password);
      const teacher = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email: email || null,
        className: className || null,
        role: "teacher",
        schoolName: admin.schoolName,
        institutionType: "school",
        institutionRole: "ucitelj",
        approved: true,
        maxStudentAccounts: admin.maxStudentAccounts || 30,
        createdBySchoolAdminId: admin.id,
      } as any);

      const { password: _, ...teacherWithoutPassword } = teacher;
      res.status(201).json(teacherWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/school-admin/delete-teacher/:teacherId", requireSchoolAdmin, async (req, res) => {
    try {
      const teacher = await storage.getUser(req.params.teacherId as string);
      if (!teacher || teacher.createdBySchoolAdminId !== req.session.userId) {
        return res.status(404).json({ message: "Učitelj nije pronađen" });
      }

      const students = await storage.getStudentsByTeacherId(teacher.id);
      for (const student of students) {
        await storage.deleteQuizResultsByUserId(student.id);
        await storage.deleteUser(student.id);
      }

      await storage.deleteUser(teacher.id);
      res.json({ message: "Učitelj i njegovi učenici su obrisani" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== ADULT LEADERBOARD ====================

  app.get("/api/leaderboard/adults", async (req, res) => {
    try {
      const { period = "week" } = req.query;

      let startDate: Date;
      const now = new Date();

      if (period === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      const leaderboard = await storage.getLeaderboard(startDate, "A");
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching adult leaderboard:", error);
      res.status(500).json({ message: "Greška pri preuzimanju rang liste" });
    }
  });

  app.get("/api/book-listings", async (_req, res) => {
    try {
      const listings = await storage.getAllBookListings();
      const userIds = [...new Set(listings.map(l => l.userId))];
      const allUsers = await storage.getAllUsers();
      const userMap = new Map(allUsers.map(u => [u.id, u]));
      const enriched = listings.map(l => ({
        ...l,
        userName: userMap.get(l.userId)?.fullName ?? "Nepoznat",
      }));
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/book-listings/my", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getBookListingsByUserId(req.session.userId!);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/book-listings", requireAuth, async (req, res) => {
    try {
      const parsed = insertBookListingSchema.safeParse({
        ...req.body,
        userId: req.session.userId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Neispravni podaci", errors: parsed.error.flatten() });
      }
      const listing = await storage.createBookListing(parsed.data);
      res.status(201).json(listing);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/book-listings/:id", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getBookListingsByUserId(req.session.userId!);
      const listing = listings.find(l => l.id === req.params.id);
      if (!listing && req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Nemate dozvolu" });
      }
      await storage.deleteBookListing(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/duels/my", requireAuth, async (req, res) => {
    try {
      const duels = await storage.getDuelsByUserId(req.session.userId!);
      const enriched = await Promise.all(duels.map(async (d) => {
        const challenger = await storage.getUser(d.challengerId);
        const opponent = await storage.getUser(d.opponentId);
        const winner = d.winnerId ? await storage.getUser(d.winnerId) : null;
        return {
          ...d,
          challengerName: challenger?.username || "Nepoznat",
          challengerPoints: challenger?.points ?? 0,
          opponentName: opponent?.username || "Nepoznat",
          opponentPoints: opponent?.points ?? 0,
          winnerName: winner?.username || null,
        };
      }));
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/duels/active", requireAuth, async (req, res) => {
    try {
      const duel = await storage.getActiveDuelForUser(req.session.userId!);
      if (!duel) return res.json(null);
      const challenger = await storage.getUser(duel.challengerId);
      const opponent = await storage.getUser(duel.opponentId);
      res.json({
        ...duel,
        challengerName: challenger?.username || "Nepoznat",
        challengerPoints: challenger?.points ?? 0,
        opponentName: opponent?.username || "Nepoznat",
        opponentPoints: opponent?.points ?? 0,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/duels/pending", requireAuth, async (req, res) => {
    try {
      const pending = await storage.getPendingDuelsForUser(req.session.userId!);
      const enriched = await Promise.all(pending.map(async (d) => {
        const challenger = await storage.getUser(d.challengerId);
        return {
          ...d,
          challengerName: challenger?.username || "Nepoznat",
          challengerPoints: challenger?.points ?? 0,
        };
      }));
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/duels/create", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const userRole = req.session.userRole;
      if (userRole !== "student" && userRole !== "reader") {
        return res.status(403).json({ message: "Samo učenici i čitaoci mogu izazvati na duel." });
      }

      const existing = await storage.getActiveDuelForUser(userId);
      if (existing) {
        return res.status(400).json({ message: "Već imate aktivan duel. Završite ga prvo." });
      }

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Korisnik nije pronađen" });

      const opponent = await storage.findDuelOpponent(userId, 200);
      if (!opponent) {
        return res.status(404).json({ message: "Nema dostupnog protivnika sa sličnim brojem bodova. Pokušajte kasnije." });
      }

      const targetPoints = Math.max(20, Math.round(((user.points ?? 0) + (opponent.points ?? 0)) / 2 * 0.1));
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);

      const duel = await storage.createDuel({
        challengerId: userId,
        opponentId: opponent.id,
        targetPoints,
        deadline,
        challengerStartPoints: user.points ?? 0,
        opponentStartPoints: opponent.points ?? 0,
      });

      res.json({
        ...duel,
        challengerName: user.username,
        opponentName: opponent.username,
        challengerPoints: user.points ?? 0,
        opponentPoints: opponent.points ?? 0,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/duels/:id/accept", requireAuth, async (req, res) => {
    try {
      const duel = await storage.getDuel(req.params.id);
      if (!duel) return res.status(404).json({ message: "Duel nije pronađen" });
      if (duel.opponentId !== req.session.userId) {
        return res.status(403).json({ message: "Niste protivnik u ovom duelu" });
      }
      if (duel.status !== "pending") {
        return res.status(400).json({ message: "Duel nije u statusu čekanja" });
      }

      const challenger = await storage.getUser(duel.challengerId);
      const opponent = await storage.getUser(duel.opponentId);

      const updated = await storage.updateDuelStatus(duel.id, "active");
      res.json({
        ...updated,
        challengerName: challenger?.username,
        opponentName: opponent?.username,
        challengerPoints: challenger?.points ?? 0,
        opponentPoints: opponent?.points ?? 0,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/duels/:id/decline", requireAuth, async (req, res) => {
    try {
      const duel = await storage.getDuel(req.params.id);
      if (!duel) return res.status(404).json({ message: "Duel nije pronađen" });
      if (duel.opponentId !== req.session.userId) {
        return res.status(403).json({ message: "Niste protivnik u ovom duelu" });
      }
      if (duel.status !== "pending") {
        return res.status(400).json({ message: "Duel nije u statusu čekanja" });
      }
      const updated = await storage.updateDuelStatus(duel.id, "declined");
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/duels/:id/check", requireAuth, async (req, res) => {
    try {
      const duel = await storage.getDuel(req.params.id);
      if (!duel) return res.status(404).json({ message: "Duel nije pronađen" });

      const userId = req.session.userId!;
      if (duel.challengerId !== userId && duel.opponentId !== userId) {
        return res.status(403).json({ message: "Niste učesnik ovog duela" });
      }

      if (duel.status === "completed" || duel.status === "expired" || duel.status === "declined") {
        const challenger = await storage.getUser(duel.challengerId);
        const opponent = await storage.getUser(duel.opponentId);
        return res.json({
          ...duel, finished: true,
          challengerGained: (challenger?.points ?? 0) - duel.challengerStartPoints,
          opponentGained: (opponent?.points ?? 0) - duel.opponentStartPoints,
          challengerName: challenger?.username,
          opponentName: opponent?.username,
          challengerPoints: challenger?.points ?? 0,
          opponentPoints: opponent?.points ?? 0,
        });
      }

      if (duel.status !== "active") {
        return res.json({ ...duel, finished: false });
      }

      const challenger = await storage.getUser(duel.challengerId);
      const opponent = await storage.getUser(duel.opponentId);
      const challengerGained = (challenger?.points ?? 0) - duel.challengerStartPoints;
      const opponentGained = (opponent?.points ?? 0) - duel.opponentStartPoints;

      const isExpired = new Date() > new Date(duel.deadline);

      let winnerId: string | undefined;
      if (challengerGained >= duel.targetPoints && opponentGained < duel.targetPoints) {
        winnerId = duel.challengerId;
      } else if (opponentGained >= duel.targetPoints && challengerGained < duel.targetPoints) {
        winnerId = duel.opponentId;
      } else if (isExpired && challengerGained >= duel.targetPoints && opponentGained >= duel.targetPoints) {
        winnerId = challengerGained >= opponentGained ? duel.challengerId : duel.opponentId;
      }

      if (winnerId || isExpired) {
        const freshDuel = await storage.getDuel(duel.id);
        if (freshDuel && freshDuel.status === "active") {
          if (winnerId) {
            await storage.incrementDuelWins(winnerId);
          }
          const updated = await storage.updateDuelStatus(duel.id, winnerId ? "completed" : "expired", winnerId);
          return res.json({
            ...updated, finished: true, winnerId, challengerGained, opponentGained,
            challengerName: challenger?.username,
            opponentName: opponent?.username,
            challengerPoints: challenger?.points ?? 0,
            opponentPoints: opponent?.points ?? 0,
          });
        }
        const alreadyDone = await storage.getDuel(duel.id);
        return res.json({
          ...alreadyDone, finished: true, challengerGained, opponentGained,
          challengerName: challenger?.username,
          opponentName: opponent?.username,
          challengerPoints: challenger?.points ?? 0,
          opponentPoints: opponent?.points ?? 0,
        });
      }

      res.json({
        ...duel, finished: false, challengerGained, opponentGained,
        challengerName: challenger?.username,
        opponentName: opponent?.username,
        challengerPoints: challenger?.points ?? 0,
        opponentPoints: opponent?.points ?? 0,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/generate-quizzes-bulk", requireAdmin, async (req, res) => {
    try {
      const { bookIds } = req.body;
      if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
        return res.status(400).json({ message: "bookIds niz je obavezan" });
      }

      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ message: "AI generiranje nije dostupno." });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
      });

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Process in small batches or sequence to avoid timeouts/rate limits
      for (const bookId of bookIds) {
        try {
          const book = await storage.getBook(bookId);
          if (!book) {
            results.failed++;
            results.errors.push(`Knjiga ${bookId} nije pronađena`);
            continue;
          }

          const existingQuizzes = await storage.getQuizzesByBookId(bookId);
          if (existingQuizzes.length > 0) {
            results.failed++;
            results.errors.push(`Kviz za "${book.title}" već postoji`);
            continue;
          }

          const ageLabels: Record<string, string> = {
            R1: "djeca 6-9 godina",
            R4: "djeca 10-12 godina",
            R7: "tinejdžeri 13-15 godina",
            O: "omladina 15-18 godina",
            A: "odrasli 18+",
          };
          const ageDesc = ageLabels[book.ageGroup || "R4"] || "djeca";

          const prompt = `Generiraj kviz sa 20 pitanja o knjizi "${book.title}" autora ${book.author}.
Opis: ${book.description || "Nema opisa."}
Publika: ${ageDesc}
Odgovori ISKLJUČIVO u JSON formatu:
{
  "questions": [
    {
      "questionText": "Pitanje?",
      "optionA": "A", "optionB": "B", "optionC": "C", "optionD": "D",
      "correctAnswer": "a", "points": 1
    }
  ]
}`;

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          });

          const content = response.choices[0]?.message?.content;
          if (!content) throw new Error("AI prazan odgovor");

          const parsed = JSON.parse(content);
          if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Nevalidan JSON");

          const quiz = await storage.createQuiz({
            title: `Kviz: ${book.title}`,
            bookId: book.id,
            quizAuthor: "Citanje.ba",
          });

          for (const q of parsed.questions) {
            await storage.createQuestion({
              quizId: quiz.id,
              questionText: q.questionText,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer.toLowerCase() as any,
              points: q.points || 1,
            });
          }
          results.success++;
        } catch (err: any) {
          results.failed++;
          results.errors.push(`Greška za ${bookId}: ${err.message}`);
        }
      }

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
