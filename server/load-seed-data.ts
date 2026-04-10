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

function mergeSeedParts(parts: Partial<SeedData>[]): SeedData {
  const merged: SeedData = { genres: [], books: [], bookGenres: [], quizzes: [], questions: [] };
  for (const p of parts) {
    if (p.genres) merged.genres.push(...p.genres);
    if (p.books) merged.books.push(...p.books);
    if (p.bookGenres) merged.bookGenres.push(...p.bookGenres);
    if (p.quizzes) merged.quizzes.push(...p.quizzes);
    if (p.questions) merged.questions.push(...p.questions);
    if (p.blogPosts) merged.blogPosts = [...(merged.blogPosts || []), ...p.blogPosts];
  }
  return merged;
}

export async function loadSeedData(): Promise<boolean> {
  console.log("[seed-data] === Starting seed data load (additive only, never deletes) ===");

  // Try split files first (seed-data-1.json, seed-data-2.json, seed-data-3.json)
  // then fall back to single seed-data.json
  let data: SeedData;
  const part1Path = findFile("seed-data-1.json");
  const singlePath = findFile("seed-data.json");

  if (part1Path) {
    console.log(`[seed-data] Loading split seed files from: ${part1Path}`);
    const parts: Partial<SeedData>[] = [];
    for (let i = 1; i <= 20; i++) {
      const p = findFile(`seed-data-${i}.json`);
      if (!p) break;
      console.log(`[seed-data] Part ${i}: ${(fs.statSync(p).size / 1024).toFixed(0)} KB`);
      parts.push(JSON.parse(fs.readFileSync(p, "utf-8")));
    }
    data = mergeSeedParts(parts);
    console.log(`[seed-data] Merged: ${data.books.length} books, ${data.quizzes.length} quizzes, ${data.questions.length} questions`);
  } else if (singlePath) {
    console.log(`[seed-data] Using: ${singlePath} (${(fs.statSync(singlePath).size / 1024).toFixed(0)} KB)`);
    data = JSON.parse(fs.readFileSync(singlePath, "utf-8"));
  } else {
    console.log("[seed-data] No seed-data files found, skipping.");
    return false;
  }

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
    // Safety: if DB already has >= 80% of seed books, skip BOOK seeding only.
    // Quizzes and questions are always seeded additively (they are cleaned separately).
    const dbHasEnoughBooks = bookCount >= Math.floor(data.books.length * 0.8);
    if (dbHasEnoughBooks) {
      console.log(`[seed-data] DB already has ${bookCount} books (≥80% of seed). Skipping book seeding to protect manual deletions.`);
      console.log(`[seed-data] Quiz/question seeding will still run additively.`);
    }

    const newBooks = dbHasEnoughBooks ? [] : data.books.filter((b: any) => {
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

    // Load existing (book_id, genre_id) pairs to avoid duplicates
    const existingBgPairs = new Set(
      (await client.query("SELECT book_id || '::' || genre_id as pair FROM book_genres")).rows.map((r: any) => r.pair)
    );
    for (const bg of data.bookGenres) {
      const pair = `${bg.book_id || bg.bookId}::${bg.genre_id || bg.genreId}`;
      if (existingBgPairs.has(pair)) { skipped++; continue; }
      try {
        await upsertRow(client, "book_genres", bg, bgCols);
        existingBgPairs.add(pair);
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
