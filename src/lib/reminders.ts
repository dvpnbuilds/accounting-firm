import { formatInTimeZone } from "date-fns-tz";
import { listDueForReminder, markReminderSent } from "@/lib/repos/deadlines";
import { findUserByClientId } from "@/lib/repos/users";
import { sendEmail } from "@/lib/email/resend";

const REMINDER_WINDOW_DAYS = 7;
const MANILA_TZ = "Asia/Manila";

export async function checkAndSendReminders(now: Date = new Date()) {
  const dueDeadlines = await listDueForReminder(REMINDER_WINDOW_DAYS, now);
  let sent = 0;

  for (const deadline of dueDeadlines) {
    const portalUser = await findUserByClientId(deadline.clientId);
    if (!portalUser) continue;

    const dueDateFormatted = formatInTimeZone(deadline.dueDate, MANILA_TZ, "MMMM d, yyyy");
    await sendEmail({
      to: portalUser.email,
      subject: `Reminder: ${deadline.template.name} due ${dueDateFormatted}`,
      body: `Hi ${deadline.client.name},\n\nThis is a reminder that your ${deadline.template.name} is due on ${dueDateFormatted}. Please prepare the necessary documents and payment ahead of the deadline.\n\n— BiziBooks`,
    });
    await markReminderSent(deadline.id);
    sent++;
  }

  return { checked: dueDeadlines.length, sent };
}
