import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      <nav className="flex items-center justify-between border-b p-4">
        <Link href="/portal/dashboard" className="font-semibold">
          BiziBooks Portal
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {session?.user.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
