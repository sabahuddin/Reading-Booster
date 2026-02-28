import pg from "pg";
import * as fs from "fs";
import * as path from "path";

interface SeedData {
  genres: any[];
  books: any[];
  bookGenres: any[];
  quizzes: any[];
  questions: any[];
  blogPosts?: any[];
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

async function upsertRow(client: pg.PoolClient, tableName: string, row: any, tableColumns: Set<string>): Promise<boolean> {
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
  console.log("[seed-data] === Starting seed data load (additive only, never deletes) ===");

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

    const data: SeedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`[seed-data] Seed file has: ${data.books.length} books, ${data.quizzes.length} quizzes, ${data.questions.length} questions, ${data.genres.length} genres`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS deleted_items (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        item_type text NOT NULL,
        item_id varchar NOT NULL,
        deleted_at timestamp DEFAULT now()
      )
    `);

    const deletedBookIds = new Set(
      (await client.query("SELECT item_id FROM deleted_items WHERE item_type = 'book'")).rows.map((r: any) => r.item_id)
    );
    const deletedQuizIds = new Set(
      (await client.query("SELECT item_id FROM deleted_items WHERE item_type = 'quiz'")).rows.map((r: any) => r.item_id)
    );

    if (deletedBookIds.size > 0 || deletedQuizIds.size > 0) {
      console.log(`[seed-data] Respecting deletions: ${deletedBookIds.size} books, ${deletedQuizIds.size} quizzes permanently excluded`);
    }

    const existingBookIds = new Set(
      (await client.query("SELECT id FROM books")).rows.map((r: any) => r.id)
    );
    const existingBookKeys = new Set(
      (await client.query("SELECT lower(title) || '::' || lower(author) as key FROM books")).rows.map((r: any) => r.key)
    );
    const existingQuizIds = new Set(
      (await client.query("SELECT id FROM quizzes")).rows.map((r: any) => r.id)
    );
    const existingQuestionIds = new Set(
      (await client.query("SELECT id FROM questions")).rows.map((r: any) => r.id)
    );
    const newBooks = data.books.filter((b: any) => {
      if (existingBookIds.has(b.id) || deletedBookIds.has(b.id)) return false;
      const key = `${(b.title || '').toLowerCase()}::${(b.author || '').toLowerCase()}`;
      if (existingBookKeys.has(key)) return false;
      existingBookKeys.add(key);
      return true;
    });
    const newQuizzes = data.quizzes.filter((q: any) => !existingQuizIds.has(q.id) && !deletedQuizIds.has(q.id));
    const deletedBookQuizIds = new Set(
      data.quizzes.filter((q: any) => deletedBookIds.has(q.bookId)).map((q: any) => q.id)
    );
    const newQuestions = data.questions.filter((q: any) => !existingQuestionIds.has(q.id) && !deletedBookQuizIds.has(q.quizId));

    console.log(`[seed-data] New items to add: ${newBooks.length} books, ${newQuizzes.length} quizzes, ${newQuestions.length} questions`);

    if (data.blogPosts && data.blogPosts.length > 0) {
      const existingBlogIds = new Set(
        (await client.query("SELECT id FROM blog_posts")).rows.map((r: any) => r.id)
      );
      const existingBlogTitles = new Set(
        (await client.query("SELECT title FROM blog_posts")).rows.map((r: any) => r.title)
      );
      const blogCols = await getTableColumns(client, "blog_posts");
      let blogInserted = 0;
      for (const bp of data.blogPosts) {
        if (existingBlogIds.has(bp.id) || existingBlogTitles.has(bp.title)) continue;
        try {
          await upsertRow(client, "blog_posts", bp, blogCols);
          blogInserted++;
        } catch (e: any) {
          console.log(`[seed-data] Blog error: ${e.message?.substring(0, 100)}`);
        }
      }
      if (blogInserted > 0) {
        console.log(`[seed-data] Blog posts added: ${blogInserted}`);
      } else {
        console.log(`[seed-data] Blog posts: all ${data.blogPosts.length} already exist`);
      }
    }

    if (newBooks.length === 0 && newQuizzes.length === 0 && newQuestions.length === 0) {
      console.log(`[seed-data] Nothing new to add. All seed data already exists.`);
      return true;
    }

    const genreCols = await getTableColumns(client, "genres");
    const bookCols = await getTableColumns(client, "books");
    const quizCols = await getTableColumns(client, "quizzes");
    const questionCols = await getTableColumns(client, "questions");
    const bgCols = await getTableColumns(client, "book_genres");

    let inserted = { genres: 0, books: 0, bookGenres: 0, quizzes: 0, questions: 0 };
    let skipped = 0;
    let errors = 0;
    const sampleErrors: string[] = [];

    for (const g of data.genres) {
      try {
        await upsertRow(client, "genres", g, genreCols);
        inserted.genres++;
      } catch (e: any) {
        skipped++;
      }
    }

    for (const b of newBooks) {
      try {
        await upsertRow(client, "books", b, bookCols);
        inserted.books++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 3) sampleErrors.push(`book(${b.title}): ${e.message?.substring(0, 100)}`);
      }
    }

    for (const bg of data.bookGenres) {
      try {
        await upsertRow(client, "book_genres", bg, bgCols);
        inserted.bookGenres++;
      } catch (e: any) {
        skipped++;
      }
    }

    for (const q of newQuizzes) {
      try {
        await upsertRow(client, "quizzes", q, quizCols);
        inserted.quizzes++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 3) sampleErrors.push(`quiz(${q.title}): ${e.message?.substring(0, 100)}`);
      }
    }

    let qInserted = 0;
    for (const q of newQuestions) {
      try {
        await upsertRow(client, "questions", q, questionCols);
        qInserted++;
      } catch (e: any) {
        errors++;
        if (sampleErrors.length < 3) sampleErrors.push(`question: ${e.message?.substring(0, 100)}`);
      }
      if (qInserted % 500 === 0 && qInserted > 0) {
        console.log(`[seed-data] Questions: ${qInserted}/${newQuestions.length}...`);
      }
    }
    inserted.questions = qInserted;

    let finalBooks = 0, finalQuizzes = 0, finalQuestions = 0;
    try {
      finalBooks = parseInt((await client.query("SELECT COUNT(*) FROM books")).rows[0].count, 10);
      finalQuizzes = parseInt((await client.query("SELECT COUNT(*) FROM quizzes")).rows[0].count, 10);
      finalQuestions = parseInt((await client.query("SELECT COUNT(*) FROM questions")).rows[0].count, 10);
    } catch (e) {}

    console.log(`[seed-data] === COMPLETED (additive) ===`);
    console.log(`[seed-data] Added: ${inserted.books} books, ${inserted.quizzes} quizzes, ${inserted.questions} questions, ${inserted.genres} genres`);
    console.log(`[seed-data] Skipped (already exist): ${skipped}, Errors: ${errors}`);
    console.log(`[seed-data] Final DB: ${finalBooks} books, ${finalQuizzes} quizzes, ${finalQuestions} questions`);
    if (sampleErrors.length > 0) {
      console.log(`[seed-data] Errors:`, sampleErrors.join(" | "));
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
