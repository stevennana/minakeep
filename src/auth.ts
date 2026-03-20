import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { env } from "@/lib/config/env";
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

        const owner = await prisma.user.findUnique({
          where: {
            username
          }
        });

        if (!owner || !verifyPassword(password, owner.passwordHash)) {
          return null;
        }

        return {
          id: owner.id,
          name: owner.username
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
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name ?? session.user.name;
      }

      return session;
    }
  }
});
