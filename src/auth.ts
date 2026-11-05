import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // redefine Google with explicit scopes (auth.config already has Google;
    // we keep a single clear provider list here for login debugging)
    ...authConfig.providers,
  ],
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account, profile }) {
      const email = (user.email ?? profile?.email)?.toLowerCase();
      if (!email) {
        console.error("[auth] signIn denied: missing email", {
          provider: account?.provider,
          user,
        });
        return false;
      }

      try {
        await prisma.user.upsert({
          where: { email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            email,
            name: user.name ?? null,
            image: user.image ?? null,
          },
        });
      } catch (error) {
        console.error("[auth] signIn prisma upsert failed", error);
        // Don't lock the user out of OAuth if DB briefly fails;
        // session jwt will retry lookup.
        return true;
      }

      return true;
    },

    async jwt({ token }) {
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
            select: { id: true, email: true, name: true, image: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
            token.isAdmin = isAdminEmail(dbUser.email);
          }
        } catch (error) {
          console.error("[auth] jwt user lookup failed", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
