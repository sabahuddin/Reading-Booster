import pg from "pg";
import * as fs from "fs";
import * as path from "path";

export async function loadSeedData() {
  console.log("[seed-data] === Starting seed data check ===");
  console.log("[seed-data] CWD:", process.cwd());
  console.log("[seed-data] argv[1]:", process.argv[1]);

  const candidates = [
    path.join(process.cwd(), "server", "seed-data.sql"),
    path.join(process.cwd(), "dist", "seed-data.sql"),
    path.join(process.cwd(), "seed-data.sql"),
    path.resolve(path.dirname(process.argv[1] || ""), "seed-data.sql"),
    path.resolve(path.dirname(process.argv[1] || ""), "..", "seed-data.sql"),
    path.resolve(path.dirname(process.argv[1] || ""), "..", "server", "seed-data.sql"),
  ];

  let sqlPath: string | null = null;
  for (const p of candidates) {
    const exists = fs.existsSync(p);
    console.log(`[seed-data] Checking: ${p} => ${exists ? "FOUND" : "not found"}`);
    if (exists && !sqlPath) {
      sqlPath = p;
    }
  }

  if (!sqlPath) {
    console.log("[seed-data] ERROR: No seed-data.sql found in any location! Listing directories...");
    try {
      const cwd = process.cwd();
      console.log("[seed-data] Files in CWD:", fs.readdirSync(cwd).filter(f => f.includes("seed") || f === "dist" || f === "server").join(", "));
      const distDir = path.join(cwd, "dist");
      if (fs.existsSync(distDir)) {
        console.log("[seed-data] Files in dist/:", fs.readdirSync(distDir).join(", "));
      }
    } catch (e) {
      console.log("[seed-data] Could not list directories");
    }
    return;
  }

  console.log(`[seed-data] Using: ${sqlPath} (${(fs.statSync(sqlPath).size / 1024).toFixed(0)} KB)`);

  let pool: pg.Pool | null = null;
  let client: pg.PoolClient | null = null;
  try {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    client = await pool.connect();

    let bookCount = 0;
    let questionCount = 0;
    try {
      const existingBooks = await client.query("SELECT COUNT(*) FROM books");
      bookCount = parseInt(existingBooks.rows[0].count, 10);
    } catch (e: any) {
      console.log(`[seed-data] books table query failed: ${e.message?.substring(0, 100)}`);
    }
    try {
      const existingQuestions = await client.query("SELECT COUNT(*) FROM questions");
      questionCount = parseInt(existingQuestions.rows[0].count, 10);
    } catch (e: any) {
      console.log(`[seed-data] questions table query failed: ${e.message?.substring(0, 100)}`);
    }

    console.log(`[seed-data] Current DB state: ${bookCount} books, ${questionCount} questions`);

    if (bookCount >= 222 && questionCount >= 2500) {
      console.log(`[seed-data] Database is fully populated, skipping seed-data.sql`);
      return;
    }

    console.log(`[seed-data] Database incomplete (need 222 books & 2500+ questions), loading seed-data.sql...`);

    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = sql
      .split("\n")
      .filter(line => line.trim() && !line.trim().startsWith("--"));

    console.log(`[seed-data] Found ${statements.length} SQL statements to execute`);

    let executed = 0;
    let skipped = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        executed++;
        if (executed % 500 === 0) {
          console.log(`[seed-data] Progress: ${executed}/${statements.length} statements executed...`);
        }
      } catch (e: any) {
        const msg = e.message || "";
        if (msg.includes("duplicate") || msg.includes("already exists") || msg.includes("unique constraint") || msg.includes("violates unique")) {
          skipped++;
        } else {
          errors++;
          if (errorMessages.length < 10) {
            errorMessages.push(msg.substring(0, 200));
          }
        }
      }
    }

    let finalBookCount = 0;
    let finalQuestionCount = 0;
    try {
      const r1 = await client.query("SELECT COUNT(*) FROM books");
      finalBookCount = parseInt(r1.rows[0].count, 10);
      const r2 = await client.query("SELECT COUNT(*) FROM questions");
      finalQuestionCount = parseInt(r2.rows[0].count, 10);
    } catch (e) {}

    console.log(`[seed-data] === COMPLETED ===`);
    console.log(`[seed-data] Executed: ${executed}, Skipped duplicates: ${skipped}, Errors: ${errors}`);
    console.log(`[seed-data] Database now has: ${finalBookCount} books, ${finalQuestionCount} questions`);
    if (errorMessages.length > 0) {
      console.log(`[seed-data] Sample errors:`, errorMessages.slice(0, 5).join(" | "));
    }
  } catch (e: any) {
    console.error("[seed-data] FATAL ERROR:", e.message || e);
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}
