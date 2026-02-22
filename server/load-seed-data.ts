import pg from "pg";
import * as fs from "fs";
import * as path from "path";

interface SeedData {
  genres: any[];
  books: any[];
  bookGenres: any[];
  quizzes: any[];
  questions: any[];
}

function findFile(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), "server", filename),
    path.join(process.cwd(), "dist", filename),
    path.join(process.cwd(), filename),
    path.resolve(path.dirname(process.argv[1] || ""), filename),
    path.resolve(path.dirname(process.argv[1] || ""), "..", filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function getTableColumns(client: pg.PoolClient, tableName: string): Promise<Set<string>> {
  const res = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'`,
    [tableName]
  );
  return new Set(res.rows.map((r: any) => r.column_name));
}

async function insertRow(client: pg.PoolClient, tableName: string, row: any, tableColumns: Set<string>): Promise<boolean> {
  const fields: string[] = [];
  const placeholders: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(row)) {
    if (tableColumns.has(key) && value !== undefined) {
      fields.push(key);
      placeholders.push(`$${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) return false;

  await client.query(
    `INSERT INTO ${tableName} (${fields.join(", ")}) VALUES (${placeholders.join(", ")}) ON CONFLICT DO NOTHING`,
    values
  );
  return true;
}

export async function loadSeedData(): Promise<boolean> {
  console.log("[seed-data] === Starting seed data check ===");

  const jsonPath = findFile("seed-data.json");

  if (!jsonPath) {
    console.log("[seed-data] No seed-data.json found, skipping.");
    return false;
  }

  console.log(`[seed-data] Using: ${jsonPath} (${(fs.statSync(jsonPath).size / 1024).toFixed(0)} KB)`);

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

    if (bookCount === 222 && quizCount >= 220 && questionCount >= 2500) {
      console.log(`[seed-data] Database is correct. Skipping.`);
      return true;
    }

    console.log(`[seed-data] Database needs reload. Cleaning all data...`);

    const cleanTables = ["quiz_results", "questions", "quizzes", "book_genres", "books", "genres"];
    for (const t of cleanTables) {
      try {
        await client.query(`DELETE FROM ${t}`);
      } catch (e: any) {
        console.log(`[seed-data] Skip clean ${t}: ${e.message?.substring(0, 60)}`);
      }
    }
    console.log(`[seed-data] Cleaned all tables.`);

    const data: SeedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`[seed-data] JSON: ${data.books.length} books, ${data.quizzes.length} quizzes, ${data.questions.length} questions, ${data.genres.length} genres`);

    const genreCols = await getTableColumns(client, "genres");
    const bookCols = await getTableColumns(client, "books");
    const quizCols = await getTableColumns(client, "quizzes");
    const questionCols = await getTableColumns(client, "questions");
    const bgCols = await getTableColumns(client, "book_genres");

    console.log(`[seed-data] Columns - genres: ${Array.from(genreCols).join(",")}`);
    console.log(`[seed-data] Columns - questions: ${Array.from(questionCols).join(",")}`);

    let inserted = { genres: 0, books: 0, bookGenres: 0, quizzes: 0, questions: 0 };
    let errors = 0;
    const sampleErrors: string[] = [];

    for (const g of data.genres) {
      try {
        await insertRow(client, "genres", g, genreCols);
        inserted.genres++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 3) sampleErrors.push(`genre: ${e.message?.substring(0, 100)}`);
      }
    }

    for (const b of data.books) {
      try {
        await insertRow(client, "books", b, bookCols);
        inserted.books++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 5) sampleErrors.push(`book(${b.title}): ${e.message?.substring(0, 100)}`);
      }
    }

    for (const bg of data.bookGenres) {
      try {
        await insertRow(client, "book_genres", bg, bgCols);
        inserted.bookGenres++;
      } catch (e: any) {
        errors++;
      }
    }

    for (const q of data.quizzes) {
      try {
        await insertRow(client, "quizzes", q, quizCols);
        inserted.quizzes++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 5) sampleErrors.push(`quiz(${q.title}): ${e.message?.substring(0, 100)}`);
      }
    }

    for (let i = 0; i < data.questions.length; i++) {
      try {
        await insertRow(client, "questions", data.questions[i], questionCols);
        inserted.questions++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 5) sampleErrors.push(`question: ${e.message?.substring(0, 100)}`);
      }
      if ((i + 1) % 500 === 0) {
        console.log(`[seed-data] Questions: ${i + 1}/${data.questions.length}...`);
      }
    }

    let finalBooks = 0, finalQuizzes = 0, finalQuestions = 0;
    try {
      finalBooks = parseInt((await client.query("SELECT COUNT(*) FROM books")).rows[0].count, 10);
      finalQuizzes = parseInt((await client.query("SELECT COUNT(*) FROM quizzes")).rows[0].count, 10);
      finalQuestions = parseInt((await client.query("SELECT COUNT(*) FROM questions")).rows[0].count, 10);
    } catch (e) {}

    console.log(`[seed-data] === COMPLETED ===`);
    console.log(`[seed-data] Inserted: ${inserted.genres} genres, ${inserted.books} books, ${inserted.bookGenres} bookGenres, ${inserted.quizzes} quizzes, ${inserted.questions} questions`);
    console.log(`[seed-data] Errors: ${errors}`);
    console.log(`[seed-data] Final DB: ${finalBooks} books, ${finalQuizzes} quizzes, ${finalQuestions} questions`);
    if (sampleErrors.length > 0) {
      console.log(`[seed-data] Sample errors:`, sampleErrors.join(" | "));
    }

    return finalBooks >= 220 && finalQuestions >= 2500;
  } catch (e: any) {
    console.error("[seed-data] FATAL:", e.message || e);
    return false;
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}
