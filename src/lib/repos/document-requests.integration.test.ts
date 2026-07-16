import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createClient } from "@/lib/repos/clients";
import {
  attachDocument,
  createChecklist,
  listByClient,
  setClassification,
  updateStatus,
} from "@/lib/repos/document-requests";

let clientId: string;

afterAll(async () => {
  if (clientId) {
    await db.document.deleteMany({
      where: { documentRequest: { clientId } },
    });
    await db.documentRequest.deleteMany({ where: { clientId } });
    await db.client.delete({ where: { id: clientId } });
  }
  await db.$disconnect();
});

describe("document request checklist", () => {
  it("creates a checklist from labels", async () => {
    const client = await createClient({
      name: `Test Onboarding Client ${Date.now()}`,
      entityType: "SOLE_PROP",
      vatStatus: "NON_VAT",
    });
    clientId = client.id;

    await createChecklist(clientId, ["Valid government ID", "DTI Certificate"]);
    const requests = await listByClient(clientId);

    expect(requests).toHaveLength(2);
    expect(requests.every((r) => r.status === "PENDING")).toBe(true);
  });

  it("attaching a document marks the request UPLOADED", async () => {
    const [request] = await listByClient(clientId);

    await attachDocument(request.id, {
      fileUrl: "https://example.com/file.pdf",
      fileName: "file.pdf",
    });

    const [updated] = await listByClient(clientId);
    expect(updated.status).toBe("UPLOADED");
    expect(updated.document?.fileName).toBe("file.pdf");
  });

  it("staff can mark a request RECEIVED or REJECTED", async () => {
    const [request] = await listByClient(clientId);

    const received = await updateStatus(request.id, "RECEIVED");
    expect(received.status).toBe("RECEIVED");
  });

  it("stores an AI classification suggestion against the uploaded document", async () => {
    const [request] = await listByClient(clientId);

    await setClassification(request.id, { aiMatch: true, aiConfidence: 0.75 });
    const [updated] = await listByClient(clientId);

    expect(updated.document?.aiMatch).toBe(true);
    expect(updated.document?.aiConfidence).toBe(0.75);
    expect(updated.document?.aiClassifiedAt).not.toBeNull();
  });
});
