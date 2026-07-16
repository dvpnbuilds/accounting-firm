import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createLead, setLeadScore, listLeads } from "@/lib/repos/leads";

afterAll(async () => {
  await db.$disconnect();
});

describe("leads", () => {
  it("creates a lead and stores its AI qualification score/reasoning", async () => {
    const lead = await createLead({
      name: "Test Prospect",
      email: `lead-test-${Date.now()}@example.com`,
      message: "We need urgent monthly bookkeeping for our corporation.",
    });
    expect(lead.score).toBeNull();

    const scored = await setLeadScore(lead.id, { score: 78, reasoning: "Mentions urgency and recurring need." });
    expect(scored.score).toBe(78);
    expect(scored.reasoning).toBe("Mentions urgency and recurring need.");

    const all = await listLeads();
    expect(all.some((l) => l.id === lead.id)).toBe(true);

    await db.lead.delete({ where: { id: lead.id } });
  });
});
