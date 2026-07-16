import { db } from "@/lib/db";

export function createLead(data: { name: string; email: string; message: string }) {
  return db.lead.create({ data });
}

export function setLeadScore(id: string, data: { score: number; reasoning: string }) {
  return db.lead.update({ where: { id }, data });
}

export function listLeads() {
  return db.lead.findMany({ orderBy: { createdAt: "desc" } });
}
