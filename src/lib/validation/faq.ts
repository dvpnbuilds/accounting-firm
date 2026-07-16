import { z } from "zod";

export const faqQuestionSchema = z.object({
  question: z.string().min(1, "Question is required").max(500, "Keep your question under 500 characters"),
});
