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
