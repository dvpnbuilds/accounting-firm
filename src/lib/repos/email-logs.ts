import { db } from "@/lib/db";

export function logEmail(data: { to: string; subject: string; body: string }) {
  return db.emailLog.create({ data });
}
