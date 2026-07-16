"use client";

import { useState, useTransition } from "react";
import { runReminderCheckAction } from "./actions";
import { Button } from "@/components/ui/button";

export function RunReminderCheckButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const { checked, sent } = await runReminderCheckAction();
            setResult(`Checked ${checked} due deadline(s), sent ${sent} reminder(s).`);
          })
        }
      >
        {pending ? "Checking..." : "Run reminder check"}
      </Button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
