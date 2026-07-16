# Rules
1. One phase at a time. Never start phase N+1 until phase N is audited-pass.
2. Update PROGRESS.md at the end of every session.
3. No new dependencies without noting them in the decision log.
4. Keep PLAN.md immutable after approval; scope changes go through DV and get logged.
5. Write tests for each phase's completion criteria before marking it built.
6. All DB access through src/lib/repos/* — never call Prisma from components or route handlers.
7. All AI calls through src/lib/ai/openrouter.ts with a non-AI fallback path; model name comes from env, never hardcoded.
8. Every Server Action validates input with zod before touching the DB.
9. CLIENT-role users must never reach staff routes or other clients' data — add an access test for every new route.
10. All dates computed and displayed in Asia/Manila.
11. PH deadline data must cite a source (BIR/SSS/PhilHealth/Pag-IBIG page) in the decision log before seeding.
12. AI classification never auto-marks a document received — staff confirm is mandatory.
13. Emails in dev/demo go to EmailLog, not real sends, unless explicitly testing Resend.
14. No secrets in code; .env.example stays current with every new env var.
