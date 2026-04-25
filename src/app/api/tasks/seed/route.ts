import { NextRequest, NextResponse } from "next/server";
import { ensureDb, getDb, newId } from "@/lib/db";
import { TEMPLATE_TASKS } from "@/lib/seasons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Seed the template tasks for a given year. Idempotent on (year, season, title).
export async function POST(req: NextRequest) {
  await ensureDb();
  const sql = getDb();
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const year = Number(body.year) || new Date().getFullYear();
  if (year < 2000 || year > 2100) {
    return NextResponse.json({ error: "invalid year" }, { status: 400 });
  }
  // Find which template titles already exist for this year.
  const existing = await sql`
    SELECT season, title FROM sp_tasks WHERE year=${year}
  `;
  const seen = new Set(existing.map((r: Record<string, unknown>) => `${r.season}::${r.title}`));
  let inserted = 0;
  let position = 0;
  for (const t of TEMPLATE_TASKS) {
    position++;
    const key = `${t.season}::${t.title}`;
    if (seen.has(key)) continue;
    const id = newId();
    await sql`
      INSERT INTO sp_tasks (id, year, season, title, category, due_month, position, done)
      VALUES (${id}, ${year}, ${t.season}, ${t.title}, ${t.category}, ${t.due_month ?? null}, ${position}, false)
    `;
    inserted++;
  }
  return NextResponse.json({ success: true, inserted, total: TEMPLATE_TASKS.length });
}
