import { NextRequest, NextResponse } from "next/server";
import { ensureDb, getDb, newId } from "@/lib/db";
import { checkWriteLimit } from "@/lib/rate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, born_year, size_top, size_bottom, size_shoe, notes, created_at, updated_at
    FROM sp_kids
    ORDER BY born_year NULLS LAST, name
  `;
  return NextResponse.json({ kids: rows });
}

export async function POST(req: NextRequest) {
  const limit = checkWriteLimit(req.headers);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }
  await ensureDb();
  const sql = getDb();
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const name = String(body.name || "").trim();
  const born_year = body.born_year == null ? null : Number(body.born_year) || null;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (name.length > 50) return NextResponse.json({ error: "name too long" }, { status: 400 });
  const id = newId();
  await sql`
    INSERT INTO sp_kids (id, name, born_year, size_top, size_bottom, size_shoe, notes)
    VALUES (${id}, ${name}, ${born_year}, '', '', '', '')
  `;
  return NextResponse.json({ id, success: true });
}
