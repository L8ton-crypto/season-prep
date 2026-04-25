import { NextRequest, NextResponse } from "next/server";
import { ensureDb, getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  // Only specific fields are mutable.
  const sets: string[] = [];
  const vals: (string | number | boolean | null)[] = [];
  if (typeof body.done === "boolean") {
    sets.push("done");
    vals.push(body.done);
  }
  if (typeof body.title === "string" && body.title.trim()) {
    if (body.title.length > 200) return NextResponse.json({ error: "title too long" }, { status: 400 });
    sets.push("title");
    vals.push(body.title.trim());
  }
  if (typeof body.notes === "string") {
    if (body.notes.length > 1000) return NextResponse.json({ error: "notes too long" }, { status: 400 });
    sets.push("notes");
    vals.push(body.notes);
  }
  if (typeof body.category === "string") {
    sets.push("category");
    vals.push(body.category);
  }
  if (typeof body.kid_id === "string" || body.kid_id === null) {
    sets.push("kid_id");
    vals.push(body.kid_id as string | null);
  }
  if (sets.length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }
  // Build a single tagged-template UPDATE per known field. Run individually (cheap, max 5).
  for (let i = 0; i < sets.length; i++) {
    const field = sets[i];
    const val = vals[i];
    if (field === "done") {
      await sql`UPDATE sp_tasks SET done=${val as boolean}, updated_at=NOW() WHERE id=${id}`;
    } else if (field === "title") {
      await sql`UPDATE sp_tasks SET title=${val as string}, updated_at=NOW() WHERE id=${id}`;
    } else if (field === "notes") {
      await sql`UPDATE sp_tasks SET notes=${val as string}, updated_at=NOW() WHERE id=${id}`;
    } else if (field === "category") {
      await sql`UPDATE sp_tasks SET category=${val as string}, updated_at=NOW() WHERE id=${id}`;
    } else if (field === "kid_id") {
      await sql`UPDATE sp_tasks SET kid_id=${val as string | null}, updated_at=NOW() WHERE id=${id}`;
    }
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const sql = getDb();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM sp_tasks WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
