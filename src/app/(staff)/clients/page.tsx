import Link from "next/link";
import { listClients } from "@/lib/repos/clients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateClientDialog } from "./create-client-dialog";
import { ArchiveButton } from "./archive-button";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <CreateClientDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Entity type</TableHead>
            <TableHead>VAT status</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Link href={`/clients/${client.id}`} className="underline">
                  {client.name}
                </Link>
              </TableCell>
              <TableCell>{client.entityType}</TableCell>
              <TableCell>{client.vatStatus}</TableCell>
              <TableCell>
                <Badge variant={client.status === "ACTIVE" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {client.status === "ACTIVE" && <ArchiveButton id={client.id} />}
              </TableCell>
            </TableRow>
          ))}
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No clients yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
