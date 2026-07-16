import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { listTemplatesFor } from "@/lib/repos/document-request-templates";

afterAll(async () => {
  await db.$disconnect();
});

describe("document request templates", () => {
  it("includes universal templates for every client type", async () => {
    const templates = await listTemplatesFor("SOLE_PROP", "NON_VAT");
    expect(templates.some((t) => t.label === "Valid government ID")).toBe(true);
  });

  it("includes entity-specific templates and excludes the other entity's", async () => {
    const soleProp = await listTemplatesFor("SOLE_PROP", "NON_VAT");
    expect(soleProp.some((t) => t.label === "DTI Certificate of Registration")).toBe(true);
    expect(soleProp.some((t) => t.label === "SEC Certificate of Incorporation")).toBe(false);

    const corp = await listTemplatesFor("CORP", "VAT");
    expect(corp.some((t) => t.label === "SEC Certificate of Incorporation")).toBe(true);
    expect(corp.some((t) => t.label === "DTI Certificate of Registration")).toBe(false);
  });

  it("includes vat-specific templates only for matching vat status", async () => {
    const vat = await listTemplatesFor("SOLE_PROP", "VAT");
    expect(vat.some((t) => t.label === "BIR VAT Registration confirmation")).toBe(true);
    expect(vat.some((t) => t.label === "Latest percentage tax return (if any)")).toBe(false);
  });
});
