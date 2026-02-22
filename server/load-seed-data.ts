import pg from "pg";
import * as fs from "fs";
import * as path from "path";

export async function loadSeedData() {
  let sqlPath = path.join(process.cwd(), "server", "seed-data.sql");
  
  if (!fs.existsSync(sqlPath)) {
    sqlPath = path.join(process.cwd(), "dist", "seed-data.sql");
  }
  
  if (!fs.existsSync(sqlPath)) {
    sqlPath = path.join(path.dirname(process.argv[1] || ""), "seed-data.sql");
  }

  if (!fs.existsSync(sqlPath)) {
    console.log("[seed-data] No seed-data.sql found, skipping.");
    return;
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const existingBooks = await client.query("SELECT COUNT(*) FROM books");
    const existingQuestions = await client.query("SELECT COUNT(*) FROM questions");
    const bookCount = parseInt(existingBooks.rows[0].count, 10);
    const questionCount = parseInt(existingQuestions.rows[0].count, 10);
    
    if (bookCount > 0 && questionCount > 100) {
      console.log(`[seed-data] Database already has ${bookCount} books and ${questionCount} questions, skipping seed-data.sql`);
      return;
    }

    console.log(`[seed-data] Database has ${bookCount} books and ${questionCount} questions, loading seed-data.sql...`);
    
    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = sql
      .split("\n")
      .filter(line => line.trim() && !line.trim().startsWith("--"));

    let inserted = 0;
    let errors = 0;
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        inserted++;
      } catch (e: any) {
        if (!e.message?.includes("duplicate") && !e.message?.includes("already exists") && !e.message?.includes("unique constraint")) {
          errors++;
          if (errors <= 5) {
            console.error(`[seed-data] Error: ${e.message?.substring(0, 150)}`);
          }
        }
      }
    }

    console.log(`[seed-data] Done! Executed ${inserted} statements (${errors} errors) from seed-data.sql`);
  } catch (e) {
    console.error("[seed-data] Failed to load seed data:", e);
  } finally {
    client.release();
    await pool.end();
  }
}
