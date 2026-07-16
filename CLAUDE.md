# BiziBooks

Portfolio-grade web app for a Philippine bookkeeping firm: staff dashboard + client portal covering onboarding, document chasing, BIR deadline reminders, AI email drafting, FAQ chatbot, and lead qualification.

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma ORM + Postgres (Neon or Supabase free tier)
- Auth.js (NextAuth v5) — credentials provider, roles: STAFF, CLIENT
- Tailwind CSS + shadcn/ui
- OpenRouter for all AI calls (cheap models: meta-llama/llama-3.1-8b-instruct or google/gemini-flash-1.5)
- Resend for transactional email
- Deploy target: Vercel free tier

## Commands
- `dev`: npm run dev
- `test`: npm test (vitest)
- `build`: npm run build
- `db`: npx prisma migrate dev / npx prisma studio

## Conventions
- App Router with route groups: `(staff)`, `(portal)`, `(public)`
- All DB access through `src/lib/repos/*` repository modules — no Prisma calls in components or route handlers
- All AI calls through `src/lib/ai/openrouter.ts` service layer — one function per use case, model name from env
- Server Actions for mutations; zod validation on every input
- Money/dates: PHP currency, Asia/Manila timezone everywhere (use date-fns-tz)

## Workflow
- Read PLAN.md for scope and phases; PROGRESS.md for current state; RULES.md before writing code.
- Work strictly one phase at a time. After finishing a phase, run the audit-phase skill.

## Key context
- Two user roles share one User table; CLIENT users belong to a Client record, STAFF do not.
- Document checklists are generated from templates keyed by client type: SOLE_PROP or CORP x VAT or NON_VAT.
- PH compliance deadlines (BIR 2551Q, 1701Q, 2550M, SSS, PhilHealth, Pag-IBIG) live as templates in the DB, seeded in Phase 3 — verify current BIR schedules before seeding, do not trust memory.
- AI doc classification is a suggestion only: staff must confirm before a checklist item is marked received.
- Resend sandbox only delivers to verified addresses — demo mode logs emails to DB instead of failing.
- This is a demo/portfolio app: seed data quality matters as much as features.
