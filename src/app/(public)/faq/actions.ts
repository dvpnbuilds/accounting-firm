"use server";

import { faqQuestionSchema } from "@/lib/validation/faq";
import { listFaqEntries } from "@/lib/repos/faq";
import { answerFaqQuestion } from "@/lib/ai/openrouter";

export type FaqChatState = { answer?: string; error?: string };

export async function askFaqAction(_prevState: FaqChatState, formData: FormData): Promise<FaqChatState> {
  const parsed = faqQuestionSchema.safeParse({ question: formData.get("question") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const entries = await listFaqEntries();
  const result = await answerFaqQuestion(parsed.data.question, entries);
  return { answer: result.answer };
}
