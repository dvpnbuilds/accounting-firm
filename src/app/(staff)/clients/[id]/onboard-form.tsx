"use client";

import { useFormState } from "react-dom";
import { onboardClientAction, type OnboardState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OnboardState = {};

export function OnboardForm({ clientId }: { clientId: string }) {
  const [state, formAction] = useFormState(
    onboardClientAction.bind(null, clientId),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Portal login email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Portal login password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton pendingText="Onboarding...">
        Create portal login &amp; generate checklist
      </SubmitButton>
    </form>
  );
}
