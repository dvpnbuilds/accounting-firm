"use client";

import { useTransition } from "react";
import { assignDeadlinesAction } from "./actions";
import { Button } from "@/components/ui/button";

export function AssignDeadlinesButton({ clientId }: { clientId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => assignDeadlinesAction(clientId))}
    >
      {pending ? "Assigning..." : "Assign compliance calendar"}
    </Button>
  );
}
