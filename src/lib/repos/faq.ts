import { db } from "@/lib/db";

export function listFaqEntries() {
  return db.faqEntry.findMany({ orderBy: { createdAt: "asc" } });
}
