"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { uploadSchema } from "@/lib/validation/document-request";
import { getDocumentRequest, attachDocument, setClassification } from "@/lib/repos/document-requests";
import { uploadDocumentFile } from "@/lib/storage";
import { classifyDocument } from "@/lib/ai/openrouter";

async function requireClient() {
  const session = await auth();
  if (session?.user.role !== "CLIENT" || !session.user.clientId) {
    throw new Error("Forbidden");
  }
  return session.user.clientId;
}

export type UploadState = { error?: string };

export async function uploadDocumentAction(
  documentRequestId: string,
  _prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  const clientId = await requireClient();

  const documentRequest = await getDocumentRequest(documentRequestId);
  if (!documentRequest || documentRequest.clientId !== clientId) {
    return { error: "Document request not found" };
  }

  const parsed = uploadSchema.safeParse({ file: formData.get("file") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let fileUrl: string;
  try {
    fileUrl = await uploadDocumentFile(documentRequestId, parsed.data.file);
  } catch {
    return { error: "Upload failed. Please try again or contact your accountant." };
  }

  await attachDocument(documentRequestId, {
    fileUrl,
    fileName: parsed.data.file.name,
  });

  try {
    const classification = await classifyDocument(parsed.data.file.name, documentRequest.label);
    await setClassification(documentRequestId, {
      aiMatch: classification.match,
      aiConfidence: classification.confidence,
    });
  } catch {
    // Classification is advisory only (Rule 12) — the upload must succeed regardless.
  }

  revalidatePath("/portal/dashboard");
  return {};
}
