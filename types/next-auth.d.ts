import { DefaultSession, User as AuthUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      blockedReason?: string | null;
      blockedUntil?: string | null;
      hasSubscription?: boolean;
      isBlocked?: boolean;
      isPublic?: boolean;
      role: string;
      userId: string;
    } & DefaultSession['user'];
  }

  interface User extends AuthUser {
    hasSubscription?: boolean;
    isPublic?: boolean;
    password?: string;
    role: string;
  }
}
