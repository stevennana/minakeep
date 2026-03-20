import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (nextUrl.pathname.startsWith("/app")) {
        return Boolean(auth?.user);
      }

      return true;
    }
  }
} satisfies NextAuthConfig;
