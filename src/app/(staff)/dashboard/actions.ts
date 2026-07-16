"use server";

import { auth } from "@/lib/auth";
import { checkAndSendReminders } from "@/lib/reminders";

export async function runReminderCheckAction() {
  const session = await auth();
  if (session?.user.role !== "STAFF") throw new Error("Forbidden");

  return checkAndSendReminders();
}
