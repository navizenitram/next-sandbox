import { Suspense } from "react";
import { connection } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

async function DbStatus() {
  await connection();
  const result = await db
    .execute<{ version: string }>(sql`select version()`)
    .then(([row]) => ({ ok: true as const, version: row.version }))
    .catch((error: Error) => ({ ok: false as const, message: error.message }));
  return result.ok
    ? <p className="text-green-700">DB connected — {result.version}</p>
    : <p className="text-red-700">DB unreachable — {result.message}</p>;
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8 font-sans">
      <h1 className="text-2xl font-semibold">next-sandbox</h1>
      <Suspense fallback={<p>Checking database…</p>}><DbStatus /></Suspense>
    </main>
  );
}
