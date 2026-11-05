import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { isAdminEmail } from "@/lib/admin";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "missing-google-client-id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? "missing-google-client-secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;

      const email = auth?.user?.email;
      if (!email || !isAdminEmail(email)) {
        return Response.redirect(new URL("/auth/login?error=admin", nextUrl));
      }
      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
