import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { listDeadlineTemplatesFor } from "@/lib/repos/deadline-templates";

afterAll(async () => {
  await db.$disconnect();
});

describe("deadline templates", () => {
  it("includes universal templates (SSS/PhilHealth/Pag-IBIG) for every client type", async () => {
    const templates = await listDeadlineTemplatesFor("SOLE_PROP", "NON_VAT");
    expect(templates.some((t) => t.name === "SSS Contribution")).toBe(true);
    expect(templates.some((t) => t.name === "PhilHealth Contribution")).toBe(true);
    expect(templates.some((t) => t.name === "Pag-IBIG Contribution")).toBe(true);
  });

  it("includes 1701Q for SOLE_PROP only", async () => {
    const soleProp = await listDeadlineTemplatesFor("SOLE_PROP", "NON_VAT");
    expect(soleProp.some((t) => t.name.includes("1701Q"))).toBe(true);

    const corp = await listDeadlineTemplatesFor("CORP", "NON_VAT");
    expect(corp.some((t) => t.name.includes("1701Q"))).toBe(false);
  });

  it("includes 2551Q for NON_VAT and 2550Q for VAT, mutually exclusive", async () => {
    const nonVat = await listDeadlineTemplatesFor("CORP", "NON_VAT");
    expect(nonVat.some((t) => t.name.includes("2551Q"))).toBe(true);
    expect(nonVat.some((t) => t.name.includes("2550Q"))).toBe(false);

    const vat = await listDeadlineTemplatesFor("CORP", "VAT");
    expect(vat.some((t) => t.name.includes("2550Q"))).toBe(true);
    expect(vat.some((t) => t.name.includes("2551Q"))).toBe(false);
  });
});
