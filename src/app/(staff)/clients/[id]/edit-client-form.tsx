"use client";

import { useFormState } from "react-dom";
import type { Client } from "@prisma/client";
import { updateClientAction, type ClientFormState } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ClientFormState = {};

export function EditClientForm({ client }: { client: Client }) {
  const [state, formAction] = useFormState(
    updateClientAction.bind(null, client.id),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={client.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="entityType">Entity type</Label>
        <Select name="entityType" defaultValue={client.entityType}>
          <SelectTrigger id="entityType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOLE_PROP">Sole proprietorship</SelectItem>
            <SelectItem value="CORP">Corporation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="vatStatus">VAT status</Label>
        <Select name="vatStatus" defaultValue={client.vatStatus}>
          <SelectTrigger id="vatStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VAT">VAT</SelectItem>
            <SelectItem value="NON_VAT">Non-VAT</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
    </form>
  );
}
