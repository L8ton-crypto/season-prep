import { NextRequest, NextResponse } from "next/server";
import { ensureDb, getDb } from "@/lib/db";
import { checkWriteLimit } from "@/lib/rate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limit = checkWriteLimit(req.headers);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }
  await ensureDb();
  const sql = getDb();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const cap = (s: unknown, n: number) => (typeof s === "string" && s.length <= n ? s : null);
  if (typeof body.name === "string") {
    const v = body.name.trim();
    if (!v || v.length > 50) return NextResponse.json({ error: "name length" }, { status: 400 });
    await sql`UPDATE sp_kids SET name=${v}, updated_at=NOW() WHERE id=${id}`;
  }
  if (body.born_year != null) {
    const y = Number(body.born_year);
    if (!Number.isFinite(y)) return NextResponse.json({ error: "born_year" }, { status: 400 });
    await sql`UPDATE sp_kids SET born_year=${y}, updated_at=NOW() WHERE id=${id}`;
  }
  if (typeof body.size_top === "string") {
    const v = cap(body.size_top, 30);
    if (v === null) return NextResponse.json({ error: "size_top" }, { status: 400 });
    await sql`UPDATE sp_kids SET size_top=${v}, updated_at=NOW() WHERE id=${id}`;
  }
  if (typeof body.size_bottom === "string") {
    const v = cap(body.size_bottom, 30);
    if (v === null) return NextResponse.json({ error: "size_bottom" }, { status: 400 });
    await sql`UPDATE sp_kids SET size_bottom=${v}, updated_at=NOW() WHERE id=${id}`;
  }
  if (typeof body.size_shoe === "string") {
    const v = cap(body.size_shoe, 30);
    if (v === null) return NextResponse.json({ error: "size_shoe" }, { status: 400 });
    await sql`UPDATE sp_kids SET size_shoe=${v}, updated_at=NOW() WHERE id=${id}`;
  }
  if (typeof body.notes === "string") {
    const v = cap(body.notes, 500);
    if (v === null) return NextResponse.json({ error: "notes" }, { status: 400 });
    await sql`UPDATE sp_kids SET notes=${v}, updated_at=NOW() WHERE id=${id}`;
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limit = checkWriteLimit(req.headers);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }
  await ensureDb();
  const sql = getDb();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`UPDATE sp_tasks SET kid_id=NULL WHERE kid_id=${id}`;
  await sql`DELETE FROM sp_kids WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
