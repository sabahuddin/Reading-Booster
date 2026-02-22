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
  max: 100,
  message: "Previše zahtjeva. Pokušajte ponovo kasnije.",
  standardHeaders: true,
  legacyHeaders: false,
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
      runMigrations()
        .then(() => ensureUsersSeeded())
        .then(() => loadSeedData())
        .then(() => seedDatabase())
        .then(() => ensureAllBooks())
        .then(() => seedMissingQuizzes())
        .then(() => fetchBookCovers())
        .catch(console.error);
    },
  );
})();
