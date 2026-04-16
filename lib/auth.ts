import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Check env-based admin first (no DB required for initial setup)
        const adminEmail = process.env.ADMIN_EMAIL || "admin@ashacable.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";

        if (
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          return {
            id: "env-admin",
            email: adminEmail,
            name: "Administrator",
          };
        }

        // Also check DB-stored admins
        try {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });

          if (!admin) return null;

          const passwordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!passwordValid) return null;

          return {
            id: admin.id,
            email: admin.email,
            name: "Administrator",
          };
        } catch {
          // If DB is not yet set up, fall through
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
