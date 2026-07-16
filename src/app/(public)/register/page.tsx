"use client";

import { useFormState } from "react-dom";
import { registerStaff, type RegisterState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerStaff, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Staff registration</CardTitle>
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
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}
            <SubmitButton className="w-full" pendingText="Creating account...">
              Register
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
