import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createClient } from "@/lib/repos/clients";
import {
  createDeadlines,
  listByClient,
  listDueForReminder,
  markReminderSent,
} from "@/lib/repos/deadlines";

let clientId: string;
let templateId: string;

afterAll(async () => {
  if (clientId) {
    await db.deadline.deleteMany({ where: { clientId } });
    await db.client.delete({ where: { id: clientId } });
  }
  await db.$disconnect();
});

describe("deadlines", () => {
  it("creates deadlines for a client from template entries", async () => {
    const client = await createClient({
      name: `Test Deadline Client ${Date.now()}`,
      entityType: "SOLE_PROP",
      vatStatus: "NON_VAT",
    });
    clientId = client.id;

    const template = await db.deadlineTemplate.findFirstOrThrow({
      where: { name: "SSS Contribution" },
    });
    templateId = template.id;

    await createDeadlines(clientId, [
      { templateId, dueDate: new Date("2026-08-31T00:00:00Z") },
      { templateId, dueDate: new Date("2026-09-30T00:00:00Z") },
    ]);

    const deadlines = await listByClient(clientId);
    expect(deadlines).toHaveLength(2);
    expect(deadlines[0].dueDate.toISOString()).toBe("2026-08-31T00:00:00.000Z");
  });

  it("lists only deadlines due within the reminder window that haven't been reminded", async () => {
    const [soon] = await listByClient(clientId);
    const now = new Date("2026-08-25T00:00:00Z");

    const due = await listDueForReminder(7, now);
    expect(due.some((d) => d.id === soon.id)).toBe(true);

    await markReminderSent(soon.id);
    const dueAfterReminder = await listDueForReminder(7, now);
    expect(dueAfterReminder.some((d) => d.id === soon.id)).toBe(false);
  });
});
