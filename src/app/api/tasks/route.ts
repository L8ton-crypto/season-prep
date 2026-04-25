import { NextRequest, NextResponse } from "next/server";
import { ensureDb, getDb, newId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureDb();
  const sql = getDb();
  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "invalid year" }, { status: 400 });
  }
  const rows = await sql`
    SELECT id, year, season, title, category, due_month, kid_id, notes, done, position, created_at, updated_at
    FROM sp_tasks
    WHERE year = ${year}
    ORDER BY season, category, position, created_at
  `;
  return NextResponse.json({ tasks: rows, year });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const sql = getDb();
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const title = String(body.title || "").trim();
  const season = String(body.season || "").trim();
  const category = String(body.category || "general").trim();
  const year = Number(body.year) || new Date().getFullYear();
  const due_month = body.due_month == null ? null : Number(body.due_month) || null;
  const kid_id = body.kid_id ? String(body.kid_id) : null;
  const notes = String(body.notes || "");
  const allowed = ["spring", "summer", "autumn", "winter"];
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: "title too long" }, { status: 400 });
  if (!allowed.includes(season)) return NextResponse.json({ error: "invalid season" }, { status: 400 });
  if (notes.length > 1000) return NextResponse.json({ error: "notes too long" }, { status: 400 });
  const id = newId();
  await sql`
    INSERT INTO sp_tasks (id, year, season, title, category, due_month, kid_id, notes, done, position)
    VALUES (${id}, ${year}, ${season}, ${title}, ${category}, ${due_month}, ${kid_id}, ${notes}, false, 999)
  `;
  return NextResponse.json({ id, success: true });
}
