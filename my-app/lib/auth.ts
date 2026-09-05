import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const clean = (val?: string) => val?.replace(/["']/g, "").trim();

const googleClientId = clean(process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID);
const googleClientSecret = clean(process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET);
const hasGoogleAuth = !!(googleClientId && googleClientSecret);
const hasDatabase = !!process.env.DATABASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  providers: [
    ...(hasGoogleAuth
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: clean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) || "default_local_clarity_ai_secret_at_least_32_chars",
});
