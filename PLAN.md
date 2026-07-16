# BiziBooks — Plan (approved 2026-07-07)

## Vision
A portfolio-grade web app for a Philippine bookkeeping firm: staff manage clients, chase documents, and track BIR/statutory deadlines from one dashboard; clients onboard and upload documents through their own portal; AI (via OpenRouter on cheap models) classifies uploads, drafts chaser emails, answers tax FAQs, and scores inbound leads.

## Core features (v1)
- Client CRUD + auth (STAFF / CLIENT roles, client portal login)
- Onboarding wizard — auto-generates document checklist by client type (SOLE_PROP/CORP x VAT/NON_VAT)
- Document request tracker — portal upload, staff status dashboard
- PH compliance calendar — BIR 2551Q, 1701Q, 2550M, SSS, PhilHealth, Pag-IBIG templates; auto deadline reminders
- Scheduled chaser emails via Resend (demo mode: log to DB)
- AI doc auto-classification against checklist (staff confirm step)
- AI email draft assistant with escalating tone
- FAQ chatbot — RAG-lite over seeded PH tax knowledge base
- Public lead intake form + AI qualification scoring

## Deferred (not v1)
- Payments, e-signatures — different product surface
- QuickBooks/Xero integration — no API budget, demo doesn't need it
- Multi-firm tenancy — single firm keeps schema simple
- Mobile app — responsive web is enough

## Stack
Next.js 14 App Router + TypeScript, Prisma + Postgres (Neon/Supabase free), Auth.js, Tailwind + shadcn/ui, OpenRouter (llama-3.1-8b / gemini-flash), Resend, Vercel — everything free-tier, ideal for a live portfolio link.

## Phases

### Phase 1: Foundation
- Scope: Next.js scaffold, Prisma schema (User, Client, DocumentRequest, Document, DeadlineTemplate, Deadline, Lead, EmailLog, FaqEntry), Auth.js with STAFF/CLIENT roles, staff client CRUD.
- Done when: staff can register/login, create/edit/archive clients; CLIENT role blocked from staff routes; schema migrated; CRUD covered by tests.

### Phase 2: Onboarding + document tracker
- Scope: onboarding wizard (client type → auto checklist from templates), client portal login + file upload, staff dashboard with per-client document status (pending/uploaded/received/rejected).
- Done when: end-to-end flow works — staff onboards a client, client logs in and uploads a file, staff sees it and marks received; statuses correct in DB.

### Phase 3: Deadline engine
- Scope: seed PH compliance templates (verify current BIR schedules via web first), assign compliance calendar per client, generate dated deadline records, reminder scheduler + Resend emails (demo mode logs to EmailLog).
- Done when: assigning a template generates correct Asia/Manila-dated deadlines; due reminders create EmailLog entries; at least one real Resend send verified.

### Phase 4: AI core
- Scope: OpenRouter service layer (env-configured model), doc classification on upload → suggested checklist match + staff confirm UI, AI email drafts (chaser with escalating tone based on days overdue, plus general draft assistant).
- Done when: uploading a labeled test PDF yields a correct suggested match; staff can accept/reject; chaser drafts change tone at 3/7/14 days overdue; all AI calls go through the service layer with error fallbacks.

### Phase 5: FAQ + lead qualification
- Scope: seed PH tax FAQ knowledge base, RAG-lite chatbot (keyword/embedding retrieval → answer only from KB, refuse otherwise), public lead form, AI qualification score + reasoning shown in staff dashboard.
- Done when: chatbot answers KB questions and declines off-KB questions; submitted leads appear scored with visible reasoning.

### Phase 6: Polish + demo
- Scope: seed demo data (firm, 5+ clients, mixed document/deadline states, sample leads), public landing page, empty states, deploy to Vercel with env docs.
- Done when: full demo walkthrough (onboard → upload → classify → remind → FAQ → lead) works on the live Vercel URL with seeded data.

## Risks / open decisions
- PH deadline accuracy — source current BIR schedules during Phase 3; note the source in the decision log.
- Cheap-model misclassification — mitigated by mandatory staff confirm step.
- Resend sandbox limits — demo mode logs emails; document this on the landing page.
- File storage — Vercel has no persistent disk; use Supabase Storage (decide in Phase 2).
