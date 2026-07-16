"use client";

import { useState, useTransition } from "react";
import { draftChaserAction, sendClientEmailAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ChaserDraft({
  documentRequestId,
  clientId,
  clientEmail,
}: {
  documentRequestId: string;
  clientId: string;
  clientEmail: string;
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  function handleDraft() {
    setError(undefined);
    startTransition(async () => {
      const result = await draftChaserAction(documentRequestId, clientId);
      if ("error" in result) setError(result.error);
      else setDraft(result);
    });
  }

  function handleSend() {
    if (!draft) return;
    startTransition(async () => {
      const result = await sendClientEmailAction(clientId, clientEmail, draft.subject, draft.body);
      if ("error" in result) setError(result.error);
      else setSent(true);
    });
  }

  if (sent) return <p className="text-xs text-muted-foreground">Chaser sent.</p>;

  if (!draft) {
    return (
      <div className="space-y-1 text-right">
        <Button size="sm" variant="outline" disabled={pending} onClick={handleDraft}>
          {pending ? "Drafting..." : "Draft chaser email"}
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border p-3 text-left">
      <Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
      <Textarea
        rows={5}
        value={draft.body}
        onChange={(e) => setDraft({ ...draft, body: e.target.value })}
      />
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={handleSend}>
          {pending ? "Sending..." : "Send"}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setDraft(null)}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
