import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { listFaqEntries } from "@/lib/repos/faq";

afterAll(async () => {
  await db.$disconnect();
});

describe("faq entries", () => {
  it("returns the seeded PH tax/bookkeeping knowledge base", async () => {
    const entries = await listFaqEntries();
    expect(entries.length).toBeGreaterThanOrEqual(10);
    expect(entries.some((e) => e.question.includes("VAT"))).toBe(true);
  });
});
