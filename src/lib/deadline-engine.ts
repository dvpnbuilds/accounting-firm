import { fromZonedTime } from "date-fns-tz";
import type { DeadlineTemplate } from "@prisma/client";

const MANILA_TZ = "Asia/Manila";

function manilaDate(year: number, month: number, day: number): Date {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return fromZonedTime(`${year}-${mm}-${dd}T00:00:00`, MANILA_TZ);
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Parses a template's dueRule and returns the due dates it produces within the given year. */
export function computeDeadlinesForYear(
  template: Pick<DeadlineTemplate, "dueRule">,
  year: number
): Date[] {
  const rule = template.dueRule;

  const quarterly = rule.match(/^QUARTERLY:MONTHS=([\d,]+):DAY=(\d+)$/);
  if (quarterly) {
    const months = quarterly[1].split(",").map(Number);
    const day = Number(quarterly[2]);
    return months.map((month) => {
      // Month 1 (January) after a Q4 period end belongs to the following year.
      const dueYear = month === 1 ? year + 1 : year;
      return manilaDate(dueYear, month, day);
    });
  }

  const monthly = rule.match(/^MONTHLY:OFFSET=(\d+):DAY=(LAST|\d+)$/);
  if (monthly) {
    const offset = Number(monthly[1]);
    const dayToken = monthly[2];
    const dates: Date[] = [];
    for (let month = 1; month <= 12; month++) {
      let dueMonth = month + offset;
      let dueYear = year;
      if (dueMonth > 12) {
        dueMonth -= 12;
        dueYear += 1;
      }
      const day = dayToken === "LAST" ? lastDayOfMonth(dueYear, dueMonth) : Number(dayToken);
      dates.push(manilaDate(dueYear, dueMonth, day));
    }
    return dates;
  }

  throw new Error(`Unrecognized dueRule: ${rule}`);
}
