"use client";

import { useFormState } from "react-dom";
import { uploadDocumentAction, type UploadState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

const initialState: UploadState = {};

export function UploadForm({ documentRequestId }: { documentRequestId: string }) {
  const [state, formAction] = useFormState(
    uploadDocumentAction.bind(null, documentRequestId),
    initialState
  );

  return (
    <form action={formAction} className="flex items-center justify-end gap-2">
      <Input
        name="file"
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        required
        className="max-w-52"
      />
      <SubmitButton pendingText="Uploading...">Upload</SubmitButton>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
