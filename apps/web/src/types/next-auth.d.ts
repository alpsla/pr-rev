import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasPrivateAccess?: boolean;
      githubToken?: string | null;
      scope?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    hasPrivateAccess?: boolean;
    githubToken?: string | null;
    scope?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    hasPrivateAccess?: boolean;
    githubToken?: string | null;
    scope?: string;
  }
}
