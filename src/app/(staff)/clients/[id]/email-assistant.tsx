"use client";

import { useState, useTransition } from "react";
import { draftGeneralEmailAction, sendClientEmailAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EmailAssistant({ clientId, clientEmail }: { clientId: string; clientEmail: string }) {
  const [pending, startTransition] = useTransition();
  const [instructions, setInstructions] = useState("");
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  function handleDraft() {
    setError(undefined);
    setSent(false);
    startTransition(async () => {
      const result = await draftGeneralEmailAction(clientId, instructions);
      if ("error" in result) setError(result.error);
      else setDraft(result);
    });
  }

  function handleSend() {
    if (!draft) return;
    startTransition(async () => {
      const result = await sendClientEmailAction(clientId, clientEmail, draft.subject, draft.body);
      if ("error" in result) setError(result.error);
      else {
        setSent(true);
        setDraft(null);
        setInstructions("");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="instructions">What should this email say?</Label>
        <Textarea
          id="instructions"
          rows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>
      <Button size="sm" variant="outline" disabled={pending || !instructions} onClick={handleDraft}>
        {pending && !draft ? "Drafting..." : "Draft email"}
      </Button>

      {draft && (
        <div className="space-y-2 rounded-md border p-3">
          <Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          <Textarea
            rows={5}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          />
          <Button size="sm" disabled={pending} onClick={handleSend}>
            {pending ? "Sending..." : "Send"}
          </Button>
        </div>
      )}

      {sent && <p className="text-xs text-green-600">Email sent.</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
