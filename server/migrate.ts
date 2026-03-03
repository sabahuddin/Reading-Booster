import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import { sql } from "drizzle-orm";
import path from "path";
import { existsSync } from "fs";

async function runManualMigrations() {
  const migrations = [
    {
      name: "add_quiz_author_to_quizzes",
      sql: `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS quiz_author text DEFAULT ''`
    },
    {
      name: "create_book_listings",
      sql: `CREATE TABLE IF NOT EXISTS book_listings (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(36) NOT NULL,
        book_title TEXT NOT NULL,
        book_author TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT '',
        listing_type TEXT NOT NULL DEFAULT 'prodajem',
        price TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: "create_book_ratings",
      sql: `CREATE TABLE IF NOT EXISTS book_ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        book_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: "create_duels",
      sql: `CREATE TABLE IF NOT EXISTS duels (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        challenger_id VARCHAR NOT NULL,
        opponent_id VARCHAR NOT NULL,
        target_points INTEGER NOT NULL,
        deadline TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        winner_id VARCHAR,
        challenger_start_points INTEGER NOT NULL,
        opponent_start_points INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: "add_duel_wins_to_users",
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS duel_wins INTEGER NOT NULL DEFAULT 0`
    },
  ];

  for (const m of migrations) {
    try {
      await db.execute(sql.raw(m.sql));
      console.log(`[migration] ${m.name}: OK`);
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log(`[migration] ${m.name}: already applied`);
      } else {
        console.error(`[migration] ${m.name}: ERROR -`, e.message?.substring(0, 100));
      }
    }
  }

  await syncBookGenresFromLegacy();
}

async function syncBookGenresFromLegacy() {
  try {
    const legacyToSlug: Record<string, string> = {
      "lektira": "lektira",
      "klasik": "klasici",
      "klasici": "klasici",
      "avantura_fantasy": "avantura_fantasy",
      "avantura i fantazija": "avantura_fantasy",
      "fantazija": "avantura_fantasy",
      "humor": "humor",
      "roman": "roman",
      "beletristika": "beletristika",
      "bajke_basne": "bajke_basne",
      "basne": "bajke_basne",
      "zanimljiva_nauka": "zanimljiva_nauka",
      "poezija": "poezija",
      "islam": "islam",
      "drama": "klasici",
      "priče": "price_i_pjesme",
      "priče i pjesme": "price_i_pjesme",
      "price_i_pjesme": "price_i_pjesme",
      "mitologija": "mitologija",
      "detektivski roman": "detektivski_roman",
      "detektivski_roman": "detektivski_roman",
      "roman za djecu": "djeciji_roman",
      "djeciji_roman": "djeciji_roman",
      "pustolovni roman": "pustolovni_roman",
      "pustolovni_roman": "pustolovni_roman",
      "epika": "klasici",
      "istorijski": "historijski_roman",
      "historijski_roman": "historijski_roman",
      "pripovijetke": "pripovjetke",
      "pripovjetke": "pripovjetke",
      "publicistika": "beletristika",
      "autobiografija": "beletristika",
      "pisma": "klasici",
      "esej": "klasici",
      "eseji": "klasici",
      "SF": "avantura_fantasy",
      "zabavna": "humor",
      "memoari": "beletristika",
      "krimi": "detektivski_roman",
      "dnevnk": "beletristika",
      "slikovnica": "slikovnica",
      "zbirka_prica": "zbirka_prica",
    };

    const dupResult = await db.execute(sql`
      DELETE FROM book_genres
      WHERE id NOT IN (
        SELECT MIN(id) FROM book_genres GROUP BY book_id, genre_id
      )
    `);
    const dupCount = (dupResult as any).rowCount || 0;
    if (dupCount > 0) {
      console.log(`[migration] removed ${dupCount} duplicate book_genres entries`);
    }

    const genresResult = await db.execute(sql`SELECT id, slug FROM genres`);
    const genreMap = new Map<string, string>();
    for (const row of genresResult.rows as any[]) {
      genreMap.set(row.slug, row.id);
    }

    const booksResult = await db.execute(sql`
      SELECT b.id, b.genre FROM books b
      WHERE b.genre IS NOT NULL AND b.genre != ''
    `);

    let added = 0;
    for (const book of booksResult.rows as any[]) {
      const targetSlug = legacyToSlug[book.genre] || book.genre;
      const genreId = genreMap.get(targetSlug);
      if (genreId) {
        const exists = await db.execute(sql`
          SELECT 1 FROM book_genres WHERE book_id = ${book.id} AND genre_id = ${genreId} LIMIT 1
        `);
        if ((exists.rows as any[]).length === 0) {
          await db.execute(sql`INSERT INTO book_genres (book_id, genre_id) VALUES (${book.id}, ${genreId})`);
          added++;
        }
      }
    }

    if (added > 0) {
      console.log(`[migration] sync_book_genres_from_legacy: ${added} relations added`);
    } else {
      console.log(`[migration] sync_book_genres_from_legacy: all synced`);
    }
  } catch (e: any) {
    console.error(`[migration] sync_book_genres_from_legacy: ERROR -`, e.message?.substring(0, 200));
  }
}

export async function runMigrations() {
  console.log("Running database migrations...");
  try {
    let migrationsPath = path.resolve(process.cwd(), "migrations");
    if (!existsSync(migrationsPath)) {
      migrationsPath = path.resolve(path.dirname(process.argv[1] || ""), "migrations");
    }
    if (!existsSync(migrationsPath)) {
      migrationsPath = path.resolve(__dirname, "migrations");
    }
    if (!existsSync(migrationsPath)) {
      console.log("No migrations folder found, skipping migrations.");
      return;
    }
    console.log("Using migrations from:", migrationsPath);
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("Database migrations completed successfully.");
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("Tables already exist, skipping migration.");
    } else {
      console.error("Migration error:", error);
      throw error;
    }
  }

  await runManualMigrations();
}
