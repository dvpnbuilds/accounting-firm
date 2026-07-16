# BiziBooks

Portfolio-grade web app for a Philippine bookkeeping firm: staff dashboard +
client portal covering onboarding, document chasing, BIR deadline reminders,
AI email drafting, FAQ chatbot, and lead qualification.

See [CLAUDE.md](CLAUDE.md) for stack/conventions, [PLAN.md](PLAN.md) for
scope and phases, [PROGRESS.md](PROGRESS.md) for build history, and
[DEPLOY.md](DEPLOY.md) for env vars and deploy steps.

## Local development

```bash
npm install
npx prisma migrate dev
npm run db:seed     # loads demo data (see DEPLOY.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

- `npm run dev` — dev server
- `npm test` — vitest
- `npm run build` — production build
- `npx prisma migrate dev` / `npx prisma studio` — DB
- `npm run db:seed` — load demo data (idempotent)
