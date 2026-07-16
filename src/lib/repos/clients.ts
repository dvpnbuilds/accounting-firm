import { db } from "@/lib/db";
import type { ClientEntityType, ClientVatStatus } from "@prisma/client";

export function listClients() {
  return db.client.findMany({ orderBy: { createdAt: "desc" } });
}

export function getClient(id: string) {
  return db.client.findUnique({ where: { id } });
}

export function createClient(data: {
  name: string;
  entityType: ClientEntityType;
  vatStatus: ClientVatStatus;
}) {
  return db.client.create({ data });
}

export function updateClient(
  id: string,
  data: {
    name?: string;
    entityType?: ClientEntityType;
    vatStatus?: ClientVatStatus;
  }
) {
  return db.client.update({ where: { id }, data });
}

export function archiveClient(id: string) {
  return db.client.update({ where: { id }, data: { status: "ARCHIVED" } });
}
