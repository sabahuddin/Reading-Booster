import pg from "pg";
import * as fs from "fs";
import * as path from "path";

export async function loadSeedData() {
  console.log("[seed-data] === Starting seed data check ===");

  const candidates = [
    path.join(process.cwd(), "server", "seed-data.sql"),
    path.join(process.cwd(), "dist", "seed-data.sql"),
    path.join(process.cwd(), "seed-data.sql"),
    path.resolve(path.dirname(process.argv[1] || ""), "seed-data.sql"),
    path.resolve(path.dirname(process.argv[1] || ""), "..", "seed-data.sql"),
  ];

  let sqlPath: string | null = null;
  for (const p of candidates) {
    if (fs.existsSync(p) && !sqlPath) {
      sqlPath = p;
      console.log(`[seed-data] Found: ${p}`);
    }
  }

  if (!sqlPath) {
    console.log("[seed-data] No seed-data.sql found, skipping.");
    return;
  }

  console.log(`[seed-data] Using: ${sqlPath} (${(fs.statSync(sqlPath).size / 1024).toFixed(0)} KB)`);

  let pool: pg.Pool | null = null;
  let client: pg.PoolClient | null = null;
  try {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    client = await pool.connect();

    let bookCount = 0;
    let quizCount = 0;
    let questionCount = 0;
    try {
      bookCount = parseInt((await client.query("SELECT COUNT(*) FROM books")).rows[0].count, 10);
      quizCount = parseInt((await client.query("SELECT COUNT(*) FROM quizzes")).rows[0].count, 10);
      questionCount = parseInt((await client.query("SELECT COUNT(*) FROM questions")).rows[0].count, 10);
    } catch (e: any) {
      console.log(`[seed-data] Table query failed: ${e.message?.substring(0, 100)}`);
    }

    console.log(`[seed-data] Current DB: ${bookCount} books, ${quizCount} quizzes, ${questionCount} questions`);

    if (bookCount >= 220 && questionCount >= 2500) {
      console.log(`[seed-data] Database is fully populated, skipping.`);
      return;
    }

    if (questionCount > 0 && questionCount < 2500) {
      console.log(`[seed-data] Found incomplete quiz data (${questionCount} questions). Cleaning old quizzes and questions...`);
      await client.query("DELETE FROM questions");
      await client.query("DELETE FROM quizzes");
      console.log(`[seed-data] Deleted old quizzes and questions.`);
    }

    console.log(`[seed-data] Loading seed-data.sql...`);

    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = sql
      .split("\n")
      .filter(line => line.trim() && !line.trim().startsWith("--"));

    console.log(`[seed-data] Executing ${statements.length} SQL statements...`);

    let executed = 0;
    let skipped = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        executed++;
        if (executed % 500 === 0) {
          console.log(`[seed-data] Progress: ${executed}/${statements.length}...`);
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

    let finalBooks = 0, finalQuizzes = 0, finalQuestions = 0;
    try {
      finalBooks = parseInt((await client.query("SELECT COUNT(*) FROM books")).rows[0].count, 10);
      finalQuizzes = parseInt((await client.query("SELECT COUNT(*) FROM quizzes")).rows[0].count, 10);
      finalQuestions = parseInt((await client.query("SELECT COUNT(*) FROM questions")).rows[0].count, 10);
    } catch (e) {}

    console.log(`[seed-data] === DONE ===`);
    console.log(`[seed-data] Executed: ${executed}, Skipped: ${skipped}, Errors: ${errors}`);
    console.log(`[seed-data] Final DB: ${finalBooks} books, ${finalQuizzes} quizzes, ${finalQuestions} questions`);
    if (errorMessages.length > 0) {
      console.log(`[seed-data] Errors:`, errorMessages.slice(0, 5).join(" | "));
    }
  } catch (e: any) {
    console.error("[seed-data] FATAL:", e.message || e);
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}
