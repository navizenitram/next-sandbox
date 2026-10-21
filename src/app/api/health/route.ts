import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/db";

export async function GET() {
  await connection();
  try {
    const [row] = await getDb().execute<{ version: string }>(sql`select version()`);
    return Response.json({ status: "ok", db: "up", version: row.version });
  } catch (error) {
    return Response.json({ status: "error", db: "down", message: (error as Error).message }, { status: 503 });
  }
}
