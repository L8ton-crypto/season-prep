import { neon } from "@neondatabase/serverless";

let initialized = false;

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function ensureDb() {
  if (initialized) return;
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS sp_tasks (
      id TEXT PRIMARY KEY,
      year INT NOT NULL,
      season TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      due_month INT,
      kid_id TEXT,
      notes TEXT DEFAULT '',
      done BOOLEAN DEFAULT false,
      position INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sp_kids (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      born_year INT,
      size_top TEXT DEFAULT '',
      size_bottom TEXT DEFAULT '',
      size_shoe TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sp_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS sp_tasks_year_season_idx ON sp_tasks(year, season)`;
  await sql`CREATE INDEX IF NOT EXISTS sp_tasks_done_idx ON sp_tasks(done)`;

  initialized = true;
}

export function newId() {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}
