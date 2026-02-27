import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import pg from "pg";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from "./migrate";
import { seedDatabase, ensureUsersSeeded } from "./seed";
import { ensureAllBooks } from "./seed-all-books";
import { seedMissingQuizzes } from "./seed-quizzes";
import { fetchBookCovers } from "./fetch-covers";
import { loadSeedData } from "./load-seed-data";
import { ogMiddleware } from "./og-middleware";

declare module "express-session" {
  interface SessionData {
    userId: string;
    userRole: string;
    csrfToken: string;
  }
}

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

async function ensureSessionTable() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("Session table ensured.");
  } catch (err) {
    console.error("Error creating session table:", err);
  } finally {
    await pool.end();
  }
}

const PgStore = connectPgSimple(session);

function setupSession() {
  app.use(
    session({
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET || "reading-platform-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    }),
  );
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Previše neuspjelih pokušaja prijave. Pokušajte ponovo za 15 minuta.",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Previše zahtjeva. Pokušajte ponovo kasnije.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/export-seed", async (_req, res) => {
  const pg = await import("pg");
  const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const genres = (await pool.query("SELECT id, name, slug, sort_order FROM genres ORDER BY sort_order")).rows;
    const books = (await pool.query("SELECT id, title, author, description, cover_image, age_group, page_count, pdf_url, purchase_url, genre, reading_difficulty, times_read, weekly_pick, isbn, publisher, publication_year, available_in_library, copies_available, location_in_library, recommended_for_grades, language, book_format, cobiss_id, publication_city FROM books ORDER BY title")).rows;
    const quizzes = (await pool.query("SELECT id, book_id, title FROM quizzes ORDER BY title")).rows;
    const questions = (await pool.query("SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points FROM questions ORDER BY quiz_id, id")).rows;
    const bookGenres = (await pool.query("SELECT * FROM book_genres")).rows;
    res.json({ genres, books, bookGenres, quizzes, questions });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool.end();
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

app.use("/api/", apiLimiter);

app.get("/api/csrf-token", (req, res) => {
  let csrfToken = req.session.csrfToken;
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    req.session.csrfToken = csrfToken;
  }
  res.json({ csrfToken });
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.session.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export function requireTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.session.userRole !== "teacher" && req.session.userRole !== "admin") {
    return res.status(403).json({ message: "Teacher access required" });
  }
  next();
}

export function requireSchoolAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.session.userRole !== "school_admin" && req.session.userRole !== "admin") {
    return res.status(403).json({ message: "School admin access required" });
  }
  next();
}

(async () => {
  await ensureSessionTable();
  setupSession();

  // Register object storage routes for file uploads
  const { registerObjectStorageRoutes } = await import("./replit_integrations/object_storage");
  registerObjectStorageRoutes(app);

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  app.use(ogMiddleware());

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      console.log(`[startup] NODE_ENV=${process.env.NODE_ENV}, CWD=${process.cwd()}`);
      runMigrations()
        .then(() => ensureUsersSeeded())
        .then(() => loadSeedData())
        .then((seedDataLoaded) => {
          if (seedDataLoaded) {
            console.log("[startup] seed-data.sql loaded all books/quizzes. Skipping legacy seeders.");
            return;
          }
          console.log("[startup] seed-data.sql not available or failed. Running legacy seeders...");
          return seedDatabase()
            .then(() => ensureAllBooks())
            .then(() => seedMissingQuizzes());
        })
        .then(() => fetchBookCovers())
        .then(() => console.log("[startup] All startup tasks completed."))
        .catch((err) => console.error("[startup] STARTUP ERROR:", err));
    },
  );
})();
