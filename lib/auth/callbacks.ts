import { cookies } from 'next/headers';
import { NextAuthOptions } from 'next-auth';

import { getUpdatedUser } from '@/actions/auth/get-updated-user';
import { loginUser } from '@/actions/auth/login-user';
import { getUserSubscription } from '@/actions/stripe/get-user-subscription';
import { Provider, UserRole } from '@/constants/auth';
import { OTP_SECRET_SECURE } from '@/constants/otp';

import { isString } from '../guard';
import { isBusinessOwner } from '../owner';
import { absoluteUrl, encrypt } from '../utils';

export const callbacks: NextAuthOptions['callbacks'] = {
  async signIn({ user, account, profile }) {
    const cookieStore = await cookies();

    const email = user?.email ?? account?.email;
    const hasOtpSecret = cookieStore.has(`${OTP_SECRET_SECURE}:${email}`);

    if (Object.values(Provider).includes(account?.provider as Provider) && isString(email)) {
      const dbUser = await loginUser(email.toLowerCase(), user.name, user?.image, user?.password, {
        email: profile?.email,
        provider: account?.provider,
        providerId: account?.providerAccountId,
        type: account?.type,
      });

      if (!dbUser) {
        return `/restricted?code=${encodeURIComponent(encrypt({ email }, process.env.NEXTAUTH_SECRET as string))}`;
      }

      if (!hasOtpSecret && dbUser.otpSecret) {
        const redirectUrl = absoluteUrl(
          `/otp-verification?code=${encodeURIComponent(encrypt({ secret: dbUser.otpSecret, userId: dbUser.id, provider: account?.provider, email }, process.env.OTP_SECRET as string))}`,
        );

        if (account?.provider === Provider.CREDENTIALS) {
          throw new Error(redirectUrl);
        }

        return redirectUrl;
      }

      user.email = email;
      user.hasSubscription = dbUser.hasSubscription;
      user.id = dbUser.id;
      user.image = dbUser.image;
      user.isPublic = Boolean(dbUser.isPublic);
      user.name = dbUser.name;
      user.role = dbUser.role;

      return true;
    }

    return false;
  },
  async jwt({ token, user, trigger, session }) {
    if (user) {
      token.email = user.email;
      token.hasSubscription = user.hasSubscription;
      token.isPublic = user.isPublic;
      token.role = user.role;
    }

    if (trigger === 'update') {
      if (session?.name) {
        token.name = session.name;
      }

      token.picture = session.pictureUrl;
    }

    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      if (token.sub) {
        session.user.email = token.email;
        session.user.hasSubscription = Boolean(token.subscription);
        session.user.isPublic = Boolean(token.isPublic);
        session.user.userId = token.sub;
      }

      if (token.role) {
        session.user.role = (token.role as string) || UserRole.STUDENT;
      }

      const userId = session?.user?.userId;

      const updatedToken = await getUpdatedUser(userId);
      const userSubscription = isBusinessOwner(userId) || (await getUserSubscription(userId));

      if (updatedToken?.role && updatedToken.role !== session?.user?.role) {
        session.user.role = updatedToken.role;
      }

      session.user.hasSubscription = Boolean(userSubscription);
    }

    return session;
  },
};
