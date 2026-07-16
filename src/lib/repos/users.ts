import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export function findUserByClientId(clientId: string) {
  return db.user.findFirst({ where: { clientId } });
}

export function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  clientId?: string;
}) {
  return db.user.create({ data });
}
