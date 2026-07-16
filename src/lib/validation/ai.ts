import { z } from "zod";

export const generalDraftSchema = z.object({
  instructions: z
    .string()
    .min(1, "Instructions are required")
    .max(2000, "Keep instructions under 2000 characters"),
});

export const sendDraftSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject is too long"),
  body: z.string().min(1, "Body is required").max(5000, "Body is too long"),
});
