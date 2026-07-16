import { db } from "@/lib/db";

export function createDeadlines(
  clientId: string,
  entries: { templateId: string; dueDate: Date }[]
) {
  return db.deadline.createMany({
    data: entries.map((e) => ({ clientId, templateId: e.templateId, dueDate: e.dueDate })),
  });
}

export function listByClient(clientId: string) {
  return db.deadline.findMany({
    where: { clientId },
    include: { template: true },
    orderBy: { dueDate: "asc" },
  });
}

export function listDueForReminder(withinDays: number, now: Date) {
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  return db.deadline.findMany({
    where: {
      completed: false,
      reminderSentAt: null,
      dueDate: { lte: cutoff },
    },
    include: { template: true, client: true },
  });
}

export function markReminderSent(id: string) {
  return db.deadline.update({ where: { id }, data: { reminderSentAt: new Date() } });
}
