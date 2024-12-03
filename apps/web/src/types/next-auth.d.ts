import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    scope: string;
    user: {
      email: string;
      name: string;
      image?: string;
      hasPrivateAccess: boolean;
    };
  }

  interface Account {
    access_token: string;
    scope: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    scope: string;
    hasPrivateAccess: boolean;
  }
}