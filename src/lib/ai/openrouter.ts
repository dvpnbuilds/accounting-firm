import type { FaqEntry } from "@prisma/client";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Model name always comes from env (Rule 7) — never hardcoded, so swapping to a
 * different cheap model is a config change, not a code change.
 */
async function callOpenRouter(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) return null;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  }
}

function extractJson(text: string): unknown | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

// ---- Document classification ----

export type ClassificationResult = { match: boolean; confidence: number; usedAI: boolean };

function classifyByKeywords(fileName: string, label: string): { match: boolean; confidence: number } {
  const fileWords = new Set(words(fileName));
  const labelWords = words(label);
  const overlap = labelWords.filter((w) => fileWords.has(w)).length;
  const confidence = labelWords.length > 0 ? overlap / labelWords.length : 0;
  return { match: confidence >= 0.34, confidence: Math.round(confidence * 100) / 100 };
}

/** Non-AI fallback (Rule 7) when OPENROUTER_API_KEY/OPENROUTER_MODEL are unset or the call fails. */
export async function classifyDocument(fileName: string, label: string): Promise<ClassificationResult> {
  const prompt = `A client uploaded a file named "${fileName}" for the checklist item "${label}". Does the file name plausibly match this document type? Reply with ONLY a JSON object: {"match": true|false, "confidence": 0-1}.`;

  const text = await callOpenRouter(prompt);
  if (text) {
    const parsed = extractJson(text) as { match?: unknown; confidence?: unknown } | null;
    if (parsed && typeof parsed.match === "boolean" && typeof parsed.confidence === "number") {
      return { match: parsed.match, confidence: parsed.confidence, usedAI: true };
    }
  }
  return { ...classifyByKeywords(fileName, label), usedAI: false };
}

// ---- Chaser email ----

export type EmailDraft = { subject: string; body: string; usedAI: boolean };

export type ChaserTone = "friendly" | "reminder" | "urgent" | "final";

export function chaserTone(daysOverdue: number): ChaserTone {
  if (daysOverdue >= 14) return "final";
  if (daysOverdue >= 7) return "urgent";
  if (daysOverdue >= 3) return "reminder";
  return "friendly";
}

const CHASER_TEMPLATES: Record<ChaserTone, (clientName: string, label: string) => Omit<EmailDraft, "usedAI">> = {
  friendly: (clientName, label) => ({
    subject: `Quick reminder: ${label}`,
    body: `Hi ${clientName},\n\nJust a friendly note that we're still waiting on your ${label}. Whenever you get a chance, please upload it to your portal.\n\nThanks!`,
  }),
  reminder: (clientName, label) => ({
    subject: `Reminder: ${label} still needed`,
    body: `Hi ${clientName},\n\nWe still haven't received your ${label}. Could you please upload it to your portal soon so we can keep your books on track?\n\nThanks!`,
  }),
  urgent: (clientName, label) => ({
    subject: `Urgent: ${label} needed`,
    body: `Hi ${clientName},\n\nYour ${label} is now significantly overdue. Please upload it to your portal as soon as possible to avoid delays in your filings.\n\nThank you.`,
  }),
  final: (clientName, label) => ({
    subject: `Final notice: ${label} required`,
    body: `Hi ${clientName},\n\nThis is a final notice regarding your outstanding ${label}. We urgently need this document to proceed with your compliance filings. Please upload it to your portal immediately.\n\nThank you for your prompt attention.`,
  }),
};

export async function draftChaserEmail(
  clientName: string,
  label: string,
  daysOverdue: number
): Promise<EmailDraft> {
  const tone = chaserTone(daysOverdue);
  const prompt = `Write a short document-chaser email to a bookkeeping client named "${clientName}" who has not yet submitted their "${label}" document. It has been pending for ${daysOverdue} day(s). Use a ${tone} tone (tone escalates: friendly < reminder < urgent < final notice, as days overdue increases). Reply with ONLY a JSON object: {"subject": "...", "body": "..."}.`;

  const text = await callOpenRouter(prompt);
  if (text) {
    const parsed = extractJson(text) as { subject?: unknown; body?: unknown } | null;
    if (parsed && typeof parsed.subject === "string" && typeof parsed.body === "string") {
      return { subject: parsed.subject, body: parsed.body, usedAI: true };
    }
  }
  return { ...CHASER_TEMPLATES[tone](clientName, label), usedAI: false };
}

// ---- General draft assistant ----

export async function draftEmail(clientName: string, instructions: string): Promise<EmailDraft> {
  const prompt = `Draft a professional email to a bookkeeping client named "${clientName}" based on these instructions from their accountant: "${instructions}". Reply with ONLY a JSON object: {"subject": "...", "body": "..."}.`;

  const text = await callOpenRouter(prompt);
  if (text) {
    const parsed = extractJson(text) as { subject?: unknown; body?: unknown } | null;
    if (parsed && typeof parsed.subject === "string" && typeof parsed.body === "string") {
      return { subject: parsed.subject, body: parsed.body, usedAI: true };
    }
  }
  return {
    subject: `Message from your accountant`,
    body: `Hi ${clientName},\n\n${instructions}\n\nThank you.`,
    usedAI: false,
  };
}

// ---- FAQ chatbot (RAG-lite: keyword retrieval over the seeded KB, answer only from retrieved context) ----

export type FaqAnswer = { answer: string; matched: boolean; usedAI: boolean };

const FAQ_REFUSAL =
  "I don't have information about that in our knowledge base. Please contact us directly and we'll be happy to help.";
const FAQ_MATCH_THRESHOLD = 0.2;
const FAQ_TOP_K = 3;

const FAQ_STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "what", "which", "who", "how",
  "do", "does", "did", "i", "my", "me", "in", "on", "at", "to", "of", "for",
  "and", "or", "it", "this", "that", "with", "you", "your", "can", "will",
]);

/** Keyword overlap retrieval: scores each FAQ entry by how many non-stopword question words it shares. */
function retrieveFaqEntries(question: string, entries: FaqEntry[]): FaqEntry[] {
  const questionWords = words(question).filter((w) => !FAQ_STOPWORDS.has(w));
  if (questionWords.length === 0) return [];

  const scored = entries
    .map((entry) => {
      const entryWords = new Set(words(`${entry.question} ${entry.answer}`));
      const overlap = questionWords.filter((w) => entryWords.has(w)).length;
      return { entry, score: overlap / questionWords.length };
    })
    .filter(({ score }) => score >= FAQ_MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, FAQ_TOP_K).map(({ entry }) => entry);
}

/**
 * Retrieval decides relevance before AI is ever called (Rule 7's fallback), so a
 * question outside the KB is declined the same way whether or not AI is configured —
 * the model is never asked to answer from outside the retrieved context.
 */
export async function answerFaqQuestion(question: string, entries: FaqEntry[]): Promise<FaqAnswer> {
  const matches = retrieveFaqEntries(question, entries);
  if (matches.length === 0) {
    return { answer: FAQ_REFUSAL, matched: false, usedAI: false };
  }

  const context = matches.map((m, i) => `${i + 1}. Q: ${m.question}\n   A: ${m.answer}`).join("\n");
  const prompt = `You are a FAQ assistant for a Philippine bookkeeping firm. Using ONLY the knowledge base entries below, answer the client's question. If the entries don't actually answer the question, reply with ONLY the JSON {"matched": false}. Otherwise reply with ONLY {"matched": true, "answer": "..."}.\n\nKnowledge base:\n${context}\n\nQuestion: "${question}"`;

  const text = await callOpenRouter(prompt);
  if (text) {
    const parsed = extractJson(text) as { matched?: unknown; answer?: unknown } | null;
    if (parsed && parsed.matched === true && typeof parsed.answer === "string") {
      return { answer: parsed.answer, matched: true, usedAI: true };
    }
    if (parsed && parsed.matched === false) {
      return { answer: FAQ_REFUSAL, matched: false, usedAI: true };
    }
  }
  return { answer: matches[0].answer, matched: true, usedAI: false };
}

// ---- Lead qualification scoring ----

export type LeadScore = { score: number; reasoning: string; usedAI: boolean };

const LEAD_SIGNAL_KEYWORDS = [
  "urgent",
  "asap",
  "monthly",
  "payroll",
  "vat",
  "corporation",
  "corp",
  "multiple",
  "branches",
  "employees",
  "quote",
  "budget",
  "deadline",
  "penalty",
  "audit",
  "bookkeeping",
  "accountant",
  "compliance",
];

function scoreLeadByKeywords(message: string): { score: number; reasoning: string } {
  const messageWords = new Set(words(message));
  const matched = LEAD_SIGNAL_KEYWORDS.filter((k) => messageWords.has(k));
  const score = Math.min(30 + matched.length * 12, 100);
  const reasoning =
    matched.length > 0
      ? `Message mentions ${matched.length} buying-signal keyword(s): ${matched.join(", ")}.`
      : "Message is brief or generic — no strong buying signals detected.";
  return { score, reasoning };
}

/** Non-AI fallback (Rule 7) scores 0-100 by counting buying-signal keywords in the message. */
export async function scoreLead(name: string, message: string): Promise<LeadScore> {
  const prompt = `A prospective client named "${name}" submitted this inquiry to a Philippine bookkeeping firm: "${message}". Score how qualified/valuable this lead is on a scale of 0-100 (consider urgency, business complexity, and clarity of need) and give a one-sentence reason. Reply with ONLY a JSON object: {"score": 0-100, "reasoning": "..."}.`;

  const text = await callOpenRouter(prompt);
  if (text) {
    const parsed = extractJson(text) as { score?: unknown; reasoning?: unknown } | null;
    if (parsed && typeof parsed.score === "number" && typeof parsed.reasoning === "string") {
      return { score: Math.max(0, Math.min(100, parsed.score)), reasoning: parsed.reasoning, usedAI: true };
    }
  }
  return { ...scoreLeadByKeywords(message), usedAI: false };
}
