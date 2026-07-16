import { z } from "zod";

export const documentStatusSchema = z.object({
  status: z.enum(["RECEIVED", "REJECTED"]),
});

export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is required")
    .refine((f) => f.size <= 10 * 1024 * 1024, "File must be 10MB or smaller")
    .refine(
      (f) => ["application/pdf", "image/png", "image/jpeg"].includes(f.type),
      "Only PDF, PNG, or JPEG files are allowed"
    ),
});
