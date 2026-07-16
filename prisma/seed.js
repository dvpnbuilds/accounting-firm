// Demo seed data for BiziBooks (Phase 6: Polish + demo).
// Plain CommonJS (no ts-node/tsx in this project) — run via `npm run db:seed`.
// Idempotent: bails out early if the demo staff account already exists.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

const STAFF_EMAIL = "maria@bizibooks.ph";
const DEMO_PASSWORD = "Demo1234!";

async function main() {
  const existing = await db.user.findUnique({ where: { email: STAFF_EMAIL } });
  if (existing) {
    console.log("Demo data already seeded (found staff account) — skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const staff = await db.user.create({
    data: {
      name: "Maria Santos",
      email: STAFF_EMAIL,
      passwordHash,
      role: "STAFF",
    },
  });
  console.log(`Created staff account: ${staff.email}`);

  const docTemplates = await db.documentRequestTemplate.findMany();
  const deadlineTemplates = await db.deadlineTemplate.findMany();

  function templatesForDocs(entityType, vatStatus) {
    return docTemplates.filter(
      (t) =>
        (t.entityType === null || t.entityType === entityType) &&
        (t.vatStatus === null || t.vatStatus === vatStatus)
    );
  }

  function templatesForDeadlines(entityType, vatStatus) {
    return deadlineTemplates.filter(
      (t) =>
        (t.entityType === null || t.entityType === entityType) &&
        (t.vatStatus === null || t.vatStatus === vatStatus)
    );
  }

  const clientDefs = [
    {
      name: "Cebu Bites Sari-Sari Corp.",
      entityType: "CORP",
      vatStatus: "VAT",
      status: "ACTIVE",
      onboard: true,
      portalEmail: "owner@cebubites.ph",
      docStatuses: ["RECEIVED", "RECEIVED", "UPLOADED", "PENDING", "PENDING"],
    },
    {
      name: "Juan Dela Cruz Freelance Design",
      entityType: "SOLE_PROP",
      vatStatus: "NON_VAT",
      status: "ACTIVE",
      onboard: true,
      portalEmail: "juan@jdcdesign.ph",
      docStatuses: ["RECEIVED", "REJECTED", "UPLOADED", "PENDING"],
    },
    {
      name: "Mabuhay Logistics Corp.",
      entityType: "CORP",
      vatStatus: "NON_VAT",
      status: "ACTIVE",
      onboard: true,
      portalEmail: "finance@mabuhaylogistics.ph",
      docStatuses: ["RECEIVED", "RECEIVED", "RECEIVED", "RECEIVED", "RECEIVED"],
    },
    {
      name: "Isla Coffee Roasters",
      entityType: "SOLE_PROP",
      vatStatus: "VAT",
      status: "ACTIVE",
      onboard: true,
      portalEmail: "hello@islacoffee.ph",
      docStatuses: ["PENDING", "PENDING", "PENDING"],
    },
    {
      name: "Bantay Bookkeeping Retainer Co.",
      entityType: "CORP",
      vatStatus: "VAT",
      status: "ARCHIVED",
      onboard: false,
    },
    {
      name: "Tindera Online Shop",
      entityType: "SOLE_PROP",
      vatStatus: "NON_VAT",
      status: "ACTIVE",
      onboard: false, // not yet onboarded — demos the "no checklist yet" state
    },
  ];

  for (const def of clientDefs) {
    const client = await db.client.create({
      data: {
        name: def.name,
        entityType: def.entityType,
        vatStatus: def.vatStatus,
        status: def.status,
      },
    });
    console.log(`Created client: ${client.name} (${client.status})`);

    if (!def.onboard) continue;

    await db.user.create({
      data: {
        name: `${def.name} (portal)`,
        email: def.portalEmail,
        passwordHash,
        role: "CLIENT",
        clientId: client.id,
      },
    });

    const docs = templatesForDocs(def.entityType, def.vatStatus);
    for (let i = 0; i < docs.length; i++) {
      const label = docs[i].label;
      const wantStatus = def.docStatuses[i % def.docStatuses.length];
      const request = await db.documentRequest.create({
        data: { clientId: client.id, label, status: "PENDING" },
      });

      if (wantStatus === "PENDING") continue;

      await db.document.create({
        data: {
          documentRequestId: request.id,
          fileUrl: "https://example.com/demo-files/placeholder.pdf",
          fileName: `${label.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}.pdf`,
          aiMatch: true,
          aiConfidence: 0.82,
          aiClassifiedAt: new Date(),
        },
      });

      const finalStatus = wantStatus === "UPLOADED" ? "UPLOADED" : wantStatus;
      await db.documentRequest.update({
        where: { id: request.id },
        data: { status: finalStatus },
      });
    }

    // Compliance calendar: current-year deadlines, with a mix of states to
    // demo overdue / due-soon / future / completed / already-reminded.
    const templates = templatesForDeadlines(def.entityType, def.vatStatus);
    let idx = 0;
    for (const template of templates) {
      idx++;
      const offsetDays = [-10, 3, 25, -30][idx % 4];
      const dueDate = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
      const overdueAndOld = offsetDays === -30;
      await db.deadline.create({
        data: {
          clientId: client.id,
          templateId: template.id,
          dueDate,
          completed: overdueAndOld,
          reminderSentAt: offsetDays === -10 || offsetDays === 3 ? new Date() : null,
        },
      });
    }
  }

  // Sample chaser/reminder emails already sent (demo mode → EmailLog only).
  await db.emailLog.createMany({
    data: [
      {
        to: "owner@cebubites.ph",
        subject: "Reminder: BIR 2550Q due soon",
        body: "Hi Cebu Bites Sari-Sari Corp., your BIR 2550Q — Quarterly VAT Return is due soon. Please prepare the necessary documents.",
      },
      {
        to: "juan@jdcdesign.ph",
        subject: "Following up: DTI Certificate of Registration",
        body: "Hi Juan, just a friendly follow-up — we still need your DTI Certificate of Registration to complete your onboarding checklist.",
      },
    ],
  });

  // Sample inbound leads with AI-style scoring already attached (demo data,
  // not a live AI call — Rule 7's fallback/AI split only applies to the
  // live submitLeadAction path, not seed data).
  await db.lead.createMany({
    data: [
      {
        name: "Ana Reyes",
        email: "ana.reyes@example.com",
        message:
          "We urgently need monthly bookkeeping for our growing corporation, please send a quote ASAP.",
        score: 88,
        reasoning:
          "High-intent lead: mentions urgency, a recurring (monthly) engagement, and a corporate entity — strong buying signals.",
      },
      {
        name: "Pedro Santiago",
        email: "pedro.s@example.com",
        message: "Just checking what services you offer, no rush.",
        score: 35,
        reasoning: "Low urgency, exploratory inquiry with no clear service or timeline signal.",
      },
      {
        name: "Liza Cruz",
        email: "liza.cruz@example.com",
        message:
          "Our VAT-registered sole proprietorship needs help catching up on quarterly filings before the next deadline.",
        score: 74,
        reasoning:
          "Clear service need (quarterly filings) tied to a specific deadline, VAT-registered — above-average qualification.",
      },
    ],
  });

  console.log("Demo seed complete.");
  console.log(`All seeded staff/portal accounts share the password: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
