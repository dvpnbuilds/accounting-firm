import { auth } from "@/lib/auth";
import { RunReminderCheckButton } from "./run-reminder-check-button";
import { listLeads } from "@/lib/repos/leads";

export default async function DashboardPage() {
  const session = await auth();
  const leads = await listLeads();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Welcome, {session?.user.name}</h1>
      <p className="text-muted-foreground">
        Staff dashboard — client management and, in later phases, document
        tracking and deadline reminders will live here.
      </p>
      <div className="space-y-2 border-t pt-4">
        <h2 className="text-lg font-semibold">Deadline reminders</h2>
        <p className="text-sm text-muted-foreground">
          Reminders run automatically once a day via Vercel Cron. Trigger a check now for demo/testing.
        </p>
        <RunReminderCheckButton />
      </div>
      <div className="space-y-2 border-t pt-4">
        <h2 className="text-lg font-semibold">Leads</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads submitted yet.</p>
        ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <li key={lead.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {lead.name} &lt;{lead.email}&gt;
                  </span>
                  {lead.score !== null && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">
                      Score: {lead.score}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{lead.message}</p>
                {lead.reasoning && (
                  <p className="mt-1 text-xs italic text-muted-foreground">{lead.reasoning}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
