import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createClient } from "@/lib/repos/clients";
import { createUser } from "@/lib/repos/users";
import { checkAndSendReminders } from "@/lib/reminders";

let clientId: string;
let userId: string;

afterAll(async () => {
  if (clientId) {
    await db.deadline.deleteMany({ where: { clientId } });
    await db.emailLog.deleteMany({ where: { to: { contains: "reminder-test" } } });
    if (userId) await db.user.delete({ where: { id: userId } });
    await db.client.delete({ where: { id: clientId } });
  }
  await db.$disconnect();
});

describe("checkAndSendReminders", () => {
  it("logs an EmailLog entry (demo mode) for a due, unreminded deadline with a portal user", async () => {
    const client = await createClient({
      name: `Test Reminder Client ${Date.now()}`,
      entityType: "SOLE_PROP",
      vatStatus: "NON_VAT",
    });
    clientId = client.id;

    const user = await createUser({
      email: `reminder-test-${Date.now()}@example.com`,
      passwordHash: "not-a-real-hash",
      name: client.name,
      role: "CLIENT",
      clientId,
    });
    userId = user.id;

    const template = await db.deadlineTemplate.findFirstOrThrow({
      where: { name: "SSS Contribution" },
    });

    const now = new Date("2026-08-25T00:00:00Z");
    await db.deadline.create({
      data: { clientId, templateId: template.id, dueDate: new Date("2026-08-28T00:00:00Z") },
    });

    const result = await checkAndSendReminders(now);
    expect(result.checked).toBeGreaterThanOrEqual(1);
    expect(result.sent).toBeGreaterThanOrEqual(1);

    const log = await db.emailLog.findFirst({ where: { to: user.email } });
    expect(log).not.toBeNull();
    expect(log?.subject).toContain("SSS Contribution");

    const deadline = await db.deadline.findFirstOrThrow({ where: { clientId } });
    expect(deadline.reminderSentAt).not.toBeNull();
  });
});
