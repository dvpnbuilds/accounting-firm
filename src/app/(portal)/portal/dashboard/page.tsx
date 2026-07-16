import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listByClient } from "@/lib/repos/document-requests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UploadForm } from "./upload-form";

export default async function PortalDashboardPage() {
  const session = await auth();
  if (!session?.user.clientId) redirect("/login");

  const documentRequests = await listByClient(session.user.clientId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Your document checklist</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documentRequests.map((dr) => (
            <TableRow key={dr.id}>
              <TableCell>{dr.label}</TableCell>
              <TableCell>
                <Badge variant={dr.status === "RECEIVED" ? "default" : "secondary"}>
                  {dr.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {(dr.status === "PENDING" || dr.status === "REJECTED") && (
                  <UploadForm documentRequestId={dr.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
          {documentRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No documents requested yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
