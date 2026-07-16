"use client";

import { useFormState } from "react-dom";
import { askFaqAction, type FaqChatState } from "./actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

const initialState: FaqChatState = {};

export function FaqChat() {
  const [state, formAction] = useFormState(askFaqAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex gap-2">
        <Input name="question" placeholder="Ask a tax or bookkeeping question..." required className="flex-1" />
        <SubmitButton pendingText="Asking...">Ask</SubmitButton>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.answer && (
        <div className="rounded-md border bg-muted/30 p-4 text-sm">{state.answer}</div>
      )}
    </div>
  );
}
