"use client";

import { useTransition } from "react";
import { updateDocumentStatusAction } from "./actions";
import { Button } from "@/components/ui/button";

export function DocumentStatusButtons({
  documentRequestId,
  clientId,
}: {
  documentRequestId: string;
  clientId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            updateDocumentStatusAction(documentRequestId, clientId, "RECEIVED")
          )
        }
      >
        Mark received
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            updateDocumentStatusAction(documentRequestId, clientId, "REJECTED")
          )
        }
      >
        Reject
      </Button>
    </div>
  );
}
