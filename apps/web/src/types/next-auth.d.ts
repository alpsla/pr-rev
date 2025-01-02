import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    scope?: string;
    error?: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      hasPrivateAccess?: boolean;
      githubToken?: string | null;
      accessToken?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    hasPrivateAccess?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    scope?: string;
    error?: string;
    hasPrivateAccess?: boolean;
    accessTokenExpires?: number;
    githubToken?: string | null;
  }
}
