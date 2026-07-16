"use server";

import { leadSchema } from "@/lib/validation/lead";
import { createLead, setLeadScore } from "@/lib/repos/leads";
import { scoreLead } from "@/lib/ai/openrouter";

export type LeadFormState = { error?: string; success?: boolean };

export async function submitLeadAction(_prevState: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, message } = parsed.data;
  const lead = await createLead({ name, email, message });

  try {
    const result = await scoreLead(name, message);
    await setLeadScore(lead.id, { score: result.score, reasoning: result.reasoning });
  } catch {
    // Scoring is advisory only — a scoring failure must never block lead capture.
  }

  return { success: true };
}
