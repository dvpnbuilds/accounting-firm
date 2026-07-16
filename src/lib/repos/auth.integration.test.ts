import { afterAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createUser, findUserByEmail } from "@/lib/repos/users";
import { verifyCredentials } from "@/lib/verify-credentials";

const testEmail = `staff-test-${Date.now()}@bizibooks.test`;
const password = "correct-horse-battery";

afterAll(async () => {
  await db.user.deleteMany({ where: { email: testEmail } });
  await db.$disconnect();
});

describe("staff register + login", () => {
  it("registers a staff user with a hashed password", async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: "Test Staff",
      email: testEmail,
      passwordHash,
      role: "STAFF",
    });

    expect(user.role).toBe("STAFF");
    expect(user.passwordHash).not.toBe(password);

    const found = await findUserByEmail(testEmail);
    expect(found?.email).toBe(testEmail);
  });

  it("logs in with correct credentials", async () => {
    const result = await verifyCredentials(testEmail, password);
    expect(result?.role).toBe("STAFF");
    expect(result?.email).toBe(testEmail);
  });

  it("rejects an incorrect password", async () => {
    const result = await verifyCredentials(testEmail, "wrong-password");
    expect(result).toBeNull();
  });

  it("rejects a non-existent email", async () => {
    const result = await verifyCredentials("nobody@bizibooks.test", password);
    expect(result).toBeNull();
  });
});
