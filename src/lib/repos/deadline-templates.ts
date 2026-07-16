import { db } from "@/lib/db";
import type { ClientEntityType, ClientVatStatus } from "@prisma/client";

export function listDeadlineTemplatesFor(
  entityType: ClientEntityType,
  vatStatus: ClientVatStatus
) {
  return db.deadlineTemplate.findMany({
    where: {
      AND: [
        { OR: [{ entityType: null }, { entityType }] },
        { OR: [{ vatStatus: null }, { vatStatus }] },
      ],
    },
  });
}
