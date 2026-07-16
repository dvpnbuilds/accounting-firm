import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { chaserTone, classifyDocument, draftChaserEmail, draftEmail, answerFaqQuestion, scoreLead } from "@/lib/ai/openrouter";
import type { FaqEntry } from "@prisma/client";

const faqFixture: FaqEntry[] = [
  {
    id: "faq_1",
    question: "What is the difference between VAT and Non-VAT registration?",
    answer: "VAT-registered businesses charge 12% VAT; Non-VAT pay a percentage tax instead.",
    createdAt: new Date(),
  },
  {
    id: "faq_2",
    question: "What is BIR Form 2303?",
    answer: "It's the Certificate of Registration issued by the BIR.",
    createdAt: new Date(),
  },
];

// These tests exercise the non-AI fallback path (Rule 7): OPENROUTER_API_KEY/OPENROUTER_MODEL
// are cleared so no network call is made, keeping the tests deterministic.
describe("openrouter fallback behavior", () => {
  let originalKey: string | undefined;
  let originalModel: string | undefined;

  beforeEach(() => {
    originalKey = process.env.OPENROUTER_API_KEY;
    originalModel = process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = originalModel;
  });

  describe("chaserTone", () => {
    it("escalates at the 3/7/14 day thresholds", () => {
      expect(chaserTone(0)).toBe("friendly");
      expect(chaserTone(2)).toBe("friendly");
      expect(chaserTone(3)).toBe("reminder");
      expect(chaserTone(6)).toBe("reminder");
      expect(chaserTone(7)).toBe("urgent");
      expect(chaserTone(13)).toBe("urgent");
      expect(chaserTone(14)).toBe("final");
      expect(chaserTone(30)).toBe("final");
    });
  });

  describe("classifyDocument", () => {
    it("matches a file name that shares words with the checklist label", async () => {
      const result = await classifyDocument("BIR-Certificate-of-Registration.pdf", "BIR Certificate of Registration");
      expect(result.usedAI).toBe(false);
      expect(result.match).toBe(true);
    });

    it("does not match an unrelated file name", async () => {
      const result = await classifyDocument("vacation-photo.jpg", "DTI Registration");
      expect(result.usedAI).toBe(false);
      expect(result.match).toBe(false);
    });
  });

  describe("draftChaserEmail", () => {
    it("produces an escalating tone across the 3/7/14 day thresholds", async () => {
      const early = await draftChaserEmail("Juan Dela Cruz", "BIR COR", 1);
      const reminder = await draftChaserEmail("Juan Dela Cruz", "BIR COR", 3);
      const urgent = await draftChaserEmail("Juan Dela Cruz", "BIR COR", 7);
      const final = await draftChaserEmail("Juan Dela Cruz", "BIR COR", 14);

      expect(early.usedAI).toBe(false);
      expect(early.subject).not.toContain("Urgent");
      expect(early.subject).not.toContain("Final");
      expect(reminder.subject).toContain("Reminder");
      expect(urgent.subject).toContain("Urgent");
      expect(final.subject).toContain("Final notice");
    });
  });

  describe("draftEmail", () => {
    it("falls back to a template that includes the given instructions", async () => {
      const draft = await draftEmail("Juan Dela Cruz", "Ask for updated contact number");
      expect(draft.usedAI).toBe(false);
      expect(draft.body).toContain("Ask for updated contact number");
    });
  });

  describe("answerFaqQuestion", () => {
    it("answers a question that matches a KB entry", async () => {
      const result = await answerFaqQuestion("What's the difference between VAT and Non-VAT?", faqFixture);
      expect(result.usedAI).toBe(false);
      expect(result.matched).toBe(true);
      expect(result.answer).toContain("VAT-registered");
    });

    it("declines a question with no relevant KB entry", async () => {
      const result = await answerFaqQuestion("What is the weather like in Cebu today?", faqFixture);
      expect(result.usedAI).toBe(false);
      expect(result.matched).toBe(false);
      expect(result.answer).toContain("don't have information");
    });
  });

  describe("scoreLead", () => {
    it("scores higher for a message with buying-signal keywords", async () => {
      const strong = await scoreLead("Juan", "We urgently need monthly bookkeeping for our corporation, please send a quote.");
      const weak = await scoreLead("Juan", "Hi there.");
      expect(strong.usedAI).toBe(false);
      expect(weak.usedAI).toBe(false);
      expect(strong.score).toBeGreaterThan(weak.score);
      expect(strong.reasoning.length).toBeGreaterThan(0);
    });
  });
});
