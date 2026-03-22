import "next-auth";
import "next-auth/jwt";

import type { WorkspaceRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: WorkspaceRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: WorkspaceRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: WorkspaceRole;
  }
}
