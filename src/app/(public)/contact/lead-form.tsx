"use client";

import { useFormState } from "react-dom";
import { submitLeadAction, type LeadFormState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";

const initialState: LeadFormState = {};

export function LeadForm() {
  const [state, formAction] = useFormState(submitLeadAction, initialState);

  if (state.success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p>Thanks! We&apos;ve received your inquiry and will get back to you soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">How can we help?</Label>
            <Textarea id="message" name="message" rows={4} required />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <SubmitButton className="w-full" pendingText="Sending...">
            Send inquiry
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
