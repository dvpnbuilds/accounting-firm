"use client";

import { useTransition } from "react";
import { archiveClientAction } from "./actions";
import { Button } from "@/components/ui/button";

export function ArchiveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => archiveClientAction(id))}
    >
      {pending ? "Archiving..." : "Archive"}
    </Button>
  );
}
