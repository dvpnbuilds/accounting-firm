import { describe, expect, it } from "vitest";
import { formatInTimeZone } from "date-fns-tz";
import { computeDeadlinesForYear } from "@/lib/deadline-engine";

function formatted(dates: Date[]) {
  return dates.map((d) => formatInTimeZone(d, "Asia/Manila", "yyyy-MM-dd"));
}

describe("computeDeadlinesForYear", () => {
  it("computes quarterly VAT/percentage-tax dates, rolling January into the next year", () => {
    const dates = computeDeadlinesForYear(
      { dueRule: "QUARTERLY:MONTHS=4,7,10,1:DAY=25" },
      2026
    );
    expect(formatted(dates)).toEqual([
      "2026-04-25",
      "2026-07-25",
      "2026-10-25",
      "2027-01-25",
    ]);
  });

  it("computes quarterly 1701Q dates within the same year", () => {
    const dates = computeDeadlinesForYear(
      { dueRule: "QUARTERLY:MONTHS=5,8,11:DAY=15" },
      2026
    );
    expect(formatted(dates)).toEqual(["2026-05-15", "2026-08-15", "2026-11-15"]);
  });

  it("computes monthly dates on a fixed day, one per calendar month", () => {
    const dates = computeDeadlinesForYear({ dueRule: "MONTHLY:OFFSET=1:DAY=20" }, 2026);
    expect(dates).toHaveLength(12);
    expect(formatted(dates)[0]).toBe("2026-02-20");
    expect(formatted(dates)[11]).toBe("2027-01-20");
  });

  it("computes monthly dates on the last day of the following month", () => {
    const dates = computeDeadlinesForYear({ dueRule: "MONTHLY:OFFSET=1:DAY=LAST" }, 2026);
    // February 2026 has 28 days
    expect(formatted(dates)[0]).toBe("2026-02-28");
    // April 2026 has 30 days
    expect(formatted(dates)[2]).toBe("2026-04-30");
  });

  it("throws on an unrecognized dueRule", () => {
    expect(() => computeDeadlinesForYear({ dueRule: "BOGUS" }, 2026)).toThrow();
  });
});
