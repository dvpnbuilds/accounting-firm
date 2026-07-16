import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { role: Role; clientId: string | null };
        token.role = u.role;
        token.clientId = u.clientId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role;
      session.user.clientId = token.clientId;
      return session;
    },
  },
} satisfies NextAuthConfig;
