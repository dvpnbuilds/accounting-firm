"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createClientAction, type ClientFormState } from "./actions";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ClientFormState = {};

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(
    async (prev: ClientFormState, formData: FormData) => {
      const result = await createClientAction(prev, formData);
      if (!result.error) setOpen(false);
      return result;
    },
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>Add client</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entityType">Entity type</Label>
            <Select name="entityType" defaultValue="SOLE_PROP">
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
            <Select name="vatStatus" defaultValue="NON_VAT">
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
          <SubmitButton className="w-full" pendingText="Creating...">
            Create client
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
