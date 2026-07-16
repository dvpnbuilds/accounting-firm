"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { registerSchema } from "@/lib/validation/auth";
import { createUser, findUserByEmail } from "@/lib/repos/users";

export type RegisterState = { error?: string };

export async function registerStaff(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({ name, email, passwordHash, role: "STAFF" });

  redirect("/login");
}
