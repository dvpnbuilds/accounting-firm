import { db } from "@/lib/db";
import type { ClientEntityType, ClientVatStatus } from "@prisma/client";

export function listTemplatesFor(
  entityType: ClientEntityType,
  vatStatus: ClientVatStatus
) {
  return db.documentRequestTemplate.findMany({
    where: {
      AND: [
        { OR: [{ entityType: null }, { entityType }] },
        { OR: [{ vatStatus: null }, { vatStatus }] },
      ],
    },
  });
}
