"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { clientSchema } from "@/lib/validation/client";
import { createClient, updateClient, archiveClient } from "@/lib/repos/clients";

async function requireStaff() {
  const session = await auth();
  if (session?.user.role !== "STAFF") {
    throw new Error("Forbidden");
  }
}

export type ClientFormState = { error?: string };

export async function createClientAction(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireStaff();

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    entityType: formData.get("entityType"),
    vatStatus: formData.get("vatStatus"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await createClient(parsed.data);
  revalidatePath("/clients");
  return {};
}

export async function updateClientAction(
  id: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireStaff();

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    entityType: formData.get("entityType"),
    vatStatus: formData.get("vatStatus"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await updateClient(id, parsed.data);
  revalidatePath("/clients");
  return {};
}

export async function archiveClientAction(id: string) {
  await requireStaff();
  await archiveClient(id);
  revalidatePath("/clients");
}
