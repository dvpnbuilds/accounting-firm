import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  entityType: z.enum(["SOLE_PROP", "CORP"]),
  vatStatus: z.enum(["VAT", "NON_VAT"]),
});
