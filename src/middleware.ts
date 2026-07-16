import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { getRedirectPath } from "@/lib/route-guard";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const redirectPath = getRedirectPath(req.nextUrl.pathname, req.auth?.user?.role);
  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/portal/:path*"],
};
