"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { differenceInCalendarDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { auth } from "@/lib/auth";
import { onboardSchema } from "@/lib/validation/onboarding";
import { documentStatusSchema } from "@/lib/validation/document-request";
import { generalDraftSchema, sendDraftSchema } from "@/lib/validation/ai";
import { getClient } from "@/lib/repos/clients";
import { findUserByEmail, findUserByClientId, createUser } from "@/lib/repos/users";
import { listTemplatesFor } from "@/lib/repos/document-request-templates";
import { createChecklist, updateStatus, getDocumentRequest } from "@/lib/repos/document-requests";
import { listDeadlineTemplatesFor } from "@/lib/repos/deadline-templates";
import { createDeadlines, listByClient as listDeadlinesByClient } from "@/lib/repos/deadlines";
import { computeDeadlinesForYear } from "@/lib/deadline-engine";
import { draftChaserEmail, draftEmail } from "@/lib/ai/openrouter";
import { sendEmail } from "@/lib/email/resend";

async function requireStaff() {
  const session = await auth();
  if (session?.user.role !== "STAFF") {
    throw new Error("Forbidden");
  }
}

export type OnboardState = { error?: string };

export async function onboardClientAction(
  clientId: string,
  _prevState: OnboardState,
  formData: FormData
): Promise<OnboardState> {
  await requireStaff();

  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  const existing = await findUserByClientId(clientId);
  if (existing) return { error: "This client has already been onboarded" };

  const parsed = onboardSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  if (await findUserByEmail(email)) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    name: client.name,
    email,
    passwordHash,
    role: "CLIENT",
    clientId,
  });

  const templates = await listTemplatesFor(client.entityType, client.vatStatus);
  await createChecklist(clientId, templates.map((t) => t.label));

  revalidatePath(`/clients/${clientId}`);
  return {};
}

export async function assignDeadlinesAction(clientId: string) {
  await requireStaff();

  const client = await getClient(clientId);
  if (!client) throw new Error("Client not found");

  const existing = await listDeadlinesByClient(clientId);
  if (existing.length > 0) throw new Error("Compliance calendar already assigned");

  const templates = await listDeadlineTemplatesFor(client.entityType, client.vatStatus);
  const year = new Date().getFullYear();
  const entries = templates.flatMap((template) =>
    computeDeadlinesForYear(template, year).map((dueDate) => ({
      templateId: template.id,
      dueDate,
    }))
  );
  await createDeadlines(clientId, entries);

  revalidatePath(`/clients/${clientId}`);
}

export async function updateDocumentStatusAction(
  documentRequestId: string,
  clientId: string,
  status: "RECEIVED" | "REJECTED"
) {
  await requireStaff();
  const parsed = documentStatusSchema.safeParse({ status });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await updateStatus(documentRequestId, parsed.data.status);
  revalidatePath(`/clients/${clientId}`);
}

export type DraftResult = { subject: string; body: string } | { error: string };

export async function draftChaserAction(
  documentRequestId: string,
  clientId: string
): Promise<DraftResult> {
  await requireStaff();

  const documentRequest = await getDocumentRequest(documentRequestId);
  const client = await getClient(clientId);
  if (!documentRequest || !client) return { error: "Not found" };

  const daysOverdue = differenceInCalendarDays(
    toZonedTime(new Date(), "Asia/Manila"),
    toZonedTime(documentRequest.createdAt, "Asia/Manila")
  );
  const draft = await draftChaserEmail(client.name, documentRequest.label, daysOverdue);
  return { subject: draft.subject, body: draft.body };
}

export async function draftGeneralEmailAction(
  clientId: string,
  instructions: string
): Promise<DraftResult> {
  await requireStaff();

  const parsed = generalDraftSchema.safeParse({ instructions });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  const draft = await draftEmail(client.name, parsed.data.instructions);
  return { subject: draft.subject, body: draft.body };
}

export type SendResult = { sent: true } | { error: string };

export async function sendClientEmailAction(
  clientId: string,
  to: string,
  subject: string,
  body: string
): Promise<SendResult> {
  await requireStaff();

  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  const parsed = sendDraftSchema.safeParse({ to, subject, body });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await sendEmail(parsed.data);
  return { sent: true };
}
