import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  const client = globalForDb.pgClient ?? postgres(databaseUrl, { max: 10 });
  if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;
  return drizzle(client, { schema });
}

let db: ReturnType<typeof createDb> | undefined;

/** The Drizzle client, created on first use so builds don't need DATABASE_URL. */
export function getDb() {
  return (db ??= createDb());
}
