import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { env } from "@/lib/config/env";
import { DEMO_USER_ID } from "@/lib/auth/roles";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: env.authSecret,
  providers: [
    Credentials({
      credentials: {
        username: {
          label: "Username",
          type: "text"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "");
        const password = String(credentials?.password ?? "");

        if (!username || !password) {
          return null;
        }

        if (env.demoCredentials && username === env.demoCredentials.username && password === env.demoCredentials.password) {
          return {
            id: DEMO_USER_ID,
            name: username,
            role: "demo"
          };
        }

        const owner = await prisma.user.findUnique({ where: { username } });

        if (!owner || !verifyPassword(password, owner.passwordHash)) {
          return null;
        }

        return {
          id: owner.id,
          name: owner.username,
          role: "owner"
        };
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name ?? session.user.name;
        session.user.role = token.role === "demo" ? "demo" : "owner";
      }

      return session;
    }
  }
});
