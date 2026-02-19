import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import path from "path";
import { existsSync } from "fs";

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
}
