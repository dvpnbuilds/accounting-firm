import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required").max(2000, "Keep your message under 2000 characters"),
});
