# Deploying BiziBooks

This session's environment blocks Claude from reading/editing `.env` or
`.env.example` directly (permission wall hit in every phase so far — see
PROGRESS.md decision log). DV: create `.env.example` and `.env` yourself with
the vars below; `.env` is already gitignored.

## Required environment variables

| Var | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma | Pooler host, `?schema=bizibooks` |
| `DIRECT_URL` | Prisma migrations | Direct (non-pooler) host |
| `AUTH_SECRET` | Auth.js | `npx auth secret` |
| `SUPABASE_URL` | `src/lib/storage.ts` | Client document uploads |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/storage.ts` | Needs a `documents` bucket created |
| `RESEND_API_KEY` | `src/lib/email/resend.ts` | |
| `RESEND_FROM_EMAIL` | `src/lib/email/resend.ts` | |
| `RESEND_LIVE_SEND` | `src/lib/email/resend.ts` | `"true"` to send real emails; default demo mode only writes `EmailLog` |
| `CRON_SECRET` | `src/app/api/cron/reminders/route.ts` | Bearer token for the Vercel Cron job |
| `OPENROUTER_API_KEY` | `src/lib/ai/openrouter.ts` | |
| `OPENROUTER_MODEL` | `src/lib/ai/openrouter.ts` | e.g. `meta-llama/llama-3.1-8b-instruct` |

## Steps

1. Set all vars above in Vercel project settings (Production + Preview).
2. `npx prisma migrate deploy` against the production DB (or let Vercel's
   build step run it if wired into `build`).
3. `npm run db:seed` once, against the production DB, to load demo data
   (firm account `maria@bizibooks.ph`, 6 demo clients in mixed states,
   sample leads — see prisma/seed.js; idempotent, safe to re-run). Every
   seeded staff/client account shares the password `Demo1234!` — printed by
   the script; DV should rotate this before sharing the live URL publicly.
4. Deploy. Vercel Cron (`vercel.json`) hits `/api/cron/reminders` daily at
   01:00 UTC automatically once deployed — nothing else to wire up.
5. Walk the demo path on the live URL: landing page → staff login
   (`maria@bizibooks.ph`) → client detail → onboard/assign calendar →
   `/faq` → `/contact`.

## Known non-blocking gaps carried from earlier phases

- PhilHealth due date is simplified to a fixed 20th (real range: 11th-20th,
  varies by employer number) — disclosed in the Phase 3 decision log.
- `assignDeadlinesAction`'s "current year" uses server-local time rather
  than an explicit Manila-zoned year lookup (negligible except in the
  ~8-hour UTC/Manila year-boundary window).
