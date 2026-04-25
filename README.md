# SeasonPrep

Stop being caught out by changing seasons. One family checklist for every seasonal switch - wardrobe, school, holidays, home.

## Features

- 4-season tabs (Spring, Summer, Autumn, Winter) with countdown to the next season
- Pre-seeded UK-flavoured task templates (clocks change, school prep, half terms, flu jabs etc.)
- Add/edit/delete custom tasks per season and category
- Tag tasks to a specific kid
- Track per-kid sizing (tops, bottoms, shoes) so wardrobe prep is easy
- Year switcher with auto-seed on a fresh year
- Mobile-first, dark mode

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Neon Postgres via @neondatabase/serverless (ensureDb() pattern, no /api/init)
- @vercel/analytics + @vercel/speed-insights
- Deployed on Vercel

## Database

Tables (sp_ prefix):
- `sp_tasks` - per-year, per-season task list with category, due_month, kid_id
- `sp_kids` - kid profiles with current sizing
- `sp_meta` - reserved for app-level settings

## Local dev

```sh
npm install
echo "DATABASE_URL=postgresql://..." > .env.local
npm run dev
```

## API

- `GET /api/tasks?year=YYYY` - list tasks for a year
- `POST /api/tasks` - create custom task
- `PATCH /api/tasks/:id` - toggle done, edit title/notes/category/kid
- `DELETE /api/tasks/:id` - remove task
- `POST /api/tasks/seed` - seed templates for a year (idempotent)
- `GET /api/kids` - list kids
- `POST /api/kids` - add kid
- `PATCH /api/kids/:id` - update sizing/notes
- `DELETE /api/kids/:id` - remove kid (un-tags any tasks)
