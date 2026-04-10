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
    {
      name: "create_page_views",
      sql: `CREATE TABLE IF NOT EXISTS page_views (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        path TEXT NOT NULL,
        country TEXT,
        country_code TEXT,
        city TEXT,
        ip_hash TEXT,
        user_agent TEXT,
        referrer TEXT,
        user_id VARCHAR,
        visited_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: "index_page_views_visited_at",
      sql: `CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views(visited_at)`
    },
    {
      name: "index_page_views_ip_hash",
      sql: `CREATE INDEX IF NOT EXISTS idx_page_views_ip_hash ON page_views(ip_hash)`
    },
    {
      name: "index_page_views_country",
      sql: `CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country)`
    },
    {
      name: "index_quiz_results_completed_at",
      sql: `CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at)`
    },
    // ── new features 2026-04 ──────────────────────────────────────────────
    {
      name: "add_user_streak_active_fields",
      sql: `ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS weekly_streak_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_streak_week TEXT`
    },
    {
      name: "add_book_listing_image_expiry",
      sql: `ALTER TABLE book_listings
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`
    },
    {
      name: "create_notifications",
      sql: `CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        data TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: "index_notifications_user_id",
      sql: `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`
    },
    {
      name: "create_bookmarks",
      sql: `CREATE TABLE IF NOT EXISTS bookmarks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        book_id VARCHAR NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, book_id)
      )`
    },
    {
      name: "create_password_reset_tokens",
      sql: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: "add_teacher_quiz_edit_columns",
      sql: `ALTER TABLE quizzes
        ADD COLUMN IF NOT EXISTS teacher_edit_status text NOT NULL DEFAULT 'none',
        ADD COLUMN IF NOT EXISTS teacher_editor_id varchar,
        ADD COLUMN IF NOT EXISTS approved_teacher_name text`
    },
    {
      name: "add_questions_added_by_teacher",
      sql: `ALTER TABLE questions ADD COLUMN IF NOT EXISTS added_by_teacher boolean NOT NULL DEFAULT false`
    },
    {
      name: "deduplicate_book_genres",
      sql: `DELETE FROM book_genres WHERE id NOT IN (SELECT MIN(id) FROM book_genres GROUP BY book_id, genre_id)`
    },
    {
      name: "unique_book_genres_book_genre",
      sql: `ALTER TABLE book_genres ADD CONSTRAINT book_genres_book_id_genre_id_unique UNIQUE (book_id, genre_id)`
    },
    {
      name: "create_classrooms_table",
      sql: `CREATE TABLE IF NOT EXISTS classrooms (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        teacher_id VARCHAR(36) NOT NULL,
        school_name TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: "add_classroom_id_to_users",
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS classroom_id VARCHAR(36)`
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
      "lektira": "lektira", "lektire": "lektira",
      "klasik": "klasici", "klasici": "klasici",
      "avantura_fantasy": "avantura_fantasy", "avantura i fantazija": "avantura_fantasy",
      "fantazija": "avantura_fantasy", "horor": "avantura_fantasy", "SF": "avantura_fantasy",
      "humor": "humor", "zabavna": "humor",
      "roman": "roman",
      "beletristika": "beletristika", "autobiografija": "beletristika",
      "memoari": "beletristika", "dnevnk": "beletristika",
      "književnost": "beletristika", "psihologija": "beletristika", "umjetnost": "beletristika",
      "bajke_basne": "bajke_basne", "basne": "bajke_basne", "bajke": "bajke_basne", "bajka": "bajke_basne",
      "zanimljiva_nauka": "zanimljiva_nauka",
      "poezija": "poezija", "poezija_za_djecu": "poezija",
      "islam": "islam",
      "drama": "drama",
      "priče": "price_i_pjesme", "priče i pjesme": "price_i_pjesme", "price_i_pjesme": "price_i_pjesme",
      "mitologija": "mitologija",
      "detektivski roman": "detektivski_roman", "detektivski_roman": "detektivski_roman",
      "krimi": "detektivski_roman", "krimić": "detektivski_roman",
      "roman za djecu": "djeciji_roman", "djeciji_roman": "djeciji_roman", "tinejdzerski": "djeciji_roman",
      "pustolovni roman": "pustolovni_roman", "pustolovni_roman": "pustolovni_roman",
      "epika": "klasici", "pisma": "klasici", "esej": "klasici", "eseji": "klasici",
      "istorijski": "historijski_roman", "historijski_roman": "historijski_roman",
      "pripovijetke": "pripovjetke", "pripovjetke": "pripovjetke", "novela": "pripovjetke",
      "publicistika": "publicistika",
      "slikovnica": "slikovnica", "zbirka_prica": "zbirka_prica",
      "avantura": "avantura",
      "hronika": "hronika", "putopisi": "hronika",
      "savremena_knjizevnost": "savremena_knjizevnost", "savremena književnost": "savremena_knjizevnost",
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
