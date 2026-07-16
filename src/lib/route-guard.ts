import type { Role } from "@prisma/client";

const STAFF_PREFIXES = ["/dashboard", "/clients"];
const PORTAL_PREFIXES = ["/portal"];

export function getRedirectPath(pathname: string, role: Role | undefined): string | null {
  const isStaffRoute = STAFF_PREFIXES.some((p) => pathname.startsWith(p));
  const isPortalRoute = PORTAL_PREFIXES.some((p) => pathname.startsWith(p));

  if (isStaffRoute && role !== "STAFF") return "/login";
  if (isPortalRoute && role !== "CLIENT") return "/login";

  return null;
}
