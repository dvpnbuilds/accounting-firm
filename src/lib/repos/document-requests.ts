import { db } from "@/lib/db";
import type { DocumentRequestStatus } from "@prisma/client";

export function createChecklist(clientId: string, labels: string[]) {
  return db.documentRequest.createMany({
    data: labels.map((label) => ({ clientId, label })),
  });
}

export function listByClient(clientId: string) {
  return db.documentRequest.findMany({
    where: { clientId },
    include: { document: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getDocumentRequest(id: string) {
  return db.documentRequest.findUnique({ where: { id } });
}

export function updateStatus(id: string, status: DocumentRequestStatus) {
  return db.documentRequest.update({ where: { id }, data: { status } });
}

export function attachDocument(
  documentRequestId: string,
  data: { fileUrl: string; fileName: string }
) {
  return db.$transaction([
    db.document.create({ data: { documentRequestId, ...data } }),
    db.documentRequest.update({
      where: { id: documentRequestId },
      data: { status: "UPLOADED" },
    }),
  ]);
}

export function setClassification(
  documentRequestId: string,
  data: { aiMatch: boolean; aiConfidence: number }
) {
  return db.document.update({
    where: { documentRequestId },
    data: { ...data, aiClassifiedAt: new Date() },
  });
}
