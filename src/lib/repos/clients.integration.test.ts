import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  archiveClient,
  createClient,
  getClient,
  listClients,
  updateClient,
} from "@/lib/repos/clients";

const testName = `Test Client ${Date.now()}`;
let createdId: string;

afterAll(async () => {
  if (createdId) await db.client.deleteMany({ where: { id: createdId } });
  await db.$disconnect();
});

describe("client CRUD", () => {
  it("creates a client", async () => {
    const client = await createClient({
      name: testName,
      entityType: "SOLE_PROP",
      vatStatus: "NON_VAT",
    });
    createdId = client.id;

    expect(client.name).toBe(testName);
    expect(client.status).toBe("ACTIVE");
  });

  it("lists clients including the new one", async () => {
    const clients = await listClients();
    expect(clients.some((c) => c.id === createdId)).toBe(true);
  });

  it("updates a client", async () => {
    const updated = await updateClient(createdId, { vatStatus: "VAT" });
    expect(updated.vatStatus).toBe("VAT");
  });

  it("archives a client", async () => {
    const archived = await archiveClient(createdId);
    expect(archived.status).toBe("ARCHIVED");

    const fetched = await getClient(createdId);
    expect(fetched?.status).toBe("ARCHIVED");
  });
});
