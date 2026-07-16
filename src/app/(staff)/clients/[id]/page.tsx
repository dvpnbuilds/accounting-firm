import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { getClient } from "@/lib/repos/clients";
import { findUserByClientId } from "@/lib/repos/users";
import { listByClient } from "@/lib/repos/document-requests";
import { listByClient as listDeadlinesByClient } from "@/lib/repos/deadlines";
import { EditClientForm } from "./edit-client-form";
import { OnboardForm } from "./onboard-form";
import { DocumentStatusButtons } from "./document-status-buttons";
import { AssignDeadlinesButton } from "./assign-deadlines-button";
import { ChaserDraft } from "./chaser-draft";
import { EmailAssistant } from "./email-assistant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const portalUser = await findUserByClientId(id);
  const documentRequests = portalUser ? await listByClient(id) : [];
  const deadlines = await listDeadlinesByClient(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit client</h1>
      <EditClientForm client={client} />

      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold">Onboarding</h2>
        {portalUser ? (
          <p className="text-sm text-muted-foreground">
            Portal login active for {portalUser.email}.
          </p>
        ) : (
          <OnboardForm clientId={id} />
        )}
      </div>

      {portalUser && (
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">Document checklist</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentRequests.map((dr) => (
                <TableRow key={dr.id}>
                  <TableCell>
                    {dr.label}
                    {dr.document?.aiClassifiedAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        AI: {dr.document.aiMatch ? "likely matches" : "possible mismatch"} (
                        {Math.round((dr.document.aiConfidence ?? 0) * 100)}%)
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dr.status === "RECEIVED" ? "default" : "secondary"}>
                      {dr.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {dr.status === "UPLOADED" && (
                      <DocumentStatusButtons
                        documentRequestId={dr.id}
                        clientId={id}
                      />
                    )}
                    {dr.status === "PENDING" && (
                      <ChaserDraft
                        documentRequestId={dr.id}
                        clientId={id}
                        clientEmail={portalUser!.email}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compliance calendar</h2>
          {deadlines.length === 0 && <AssignDeadlinesButton clientId={id} />}
        </div>
        {deadlines.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deadline</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.template.name}</TableCell>
                  <TableCell>
                    {formatInTimeZone(d.dueDate, "Asia/Manila", "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.completed ? "default" : "secondary"}>
                      {d.completed ? "Completed" : "Upcoming"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {portalUser && (
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">AI email assistant</h2>
          <EmailAssistant clientId={id} clientEmail={portalUser.email} />
        </div>
      )}
    </div>
  );
}
