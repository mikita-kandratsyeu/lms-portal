import { compare, hash } from 'bcrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import MailRuProvider from 'next-auth/providers/mailru';
import SlackProvider from 'next-auth/providers/slack';
import VkProvider from 'next-auth/providers/vk';
import YandexProvider from 'next-auth/providers/yandex';
import { getTranslations } from 'next-intl/server';

import { UserRole } from '@/constants/auth';

import { getValueFromMemoryCache, removeValueFromMemoryCache } from '../cache';
import db from '../db';

export const providers = [
  CredentialsProvider({
    id: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      isAfterOtpPage: { label: 'isAfterOtpPage', type: 'text' },
      isSignUpFlow: { label: 'isSignUpFlow', type: 'text' },
      name: { label: 'Username', type: 'text' },
      otp: { label: 'OTP', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials): Promise<any> {
      const t = await getTranslations('auth-form');
      const user = await db.user.findFirst({
        where: { email: credentials?.email?.toLocaleLowerCase() },
      });

      const isSignUpFlow = credentials?.isSignUpFlow === 'true';
      const isAfterOtpPage = credentials?.isAfterOtpPage === 'true';
      const isWithoutPassFlow = Boolean(credentials?.otp);

      if (isAfterOtpPage && user) {
        return { ...user, ...credentials };
      }

      if (isWithoutPassFlow && user) {
        const key = `${user.id}-auth_without_pass_token`;
        const cachedOtp = await getValueFromMemoryCache(key);

        if (JSON.parse(cachedOtp ?? '{}')?.otp === credentials?.otp) {
          await removeValueFromMemoryCache(key);

          return { ...credentials };
        }

        throw new Error(t('errors.invalidOtp'));
      }

      if (isSignUpFlow) {
        if (user) {
          throw new Error(t('errors.emailExist'));
        }

        const hashedPassword = await hash(credentials?.password, 10);

        return { ...credentials, password: hashedPassword };
      }

      const isPasswordCorrect = await compare(credentials?.password ?? '', user?.password ?? '');

      if (isPasswordCorrect) {
        return { ...credentials, password: user?.password };
      }

      throw new Error(t('errors.invalidPasswordOrEmail'));
    },
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  }),
  YandexProvider({
    clientId: process.env.YANDEX_CLIENT_ID as string,
    clientSecret: process.env.YANDEX_CLIENT_SECRET as string,
  }),
  SlackProvider({
    clientId: process.env.SLACK_CLIENT_ID as string,
    clientSecret: process.env.SLACK_CLIENT_SECRET as string,
  }),
  LinkedInProvider({
    clientId: process.env.LINKEDIN_CLIENT_ID as string,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    authorization: {
      params: { scope: 'openid profile email' },
    },
    issuer: 'https://www.linkedin.com/oauth',
    jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
    profile(profile) {
      return {
        email: profile.email,
        id: profile.id,
        image: profile?.picture,
        name: profile.name,
        role: UserRole.STUDENT,
      };
    },
  }),
  MailRuProvider({
    clientId: process.env.MAILRU_CLIENT_ID as string,
    clientSecret: process.env.MAILRU_CLIENT_SECRET as string,
    authorization: 'https://oauth.mail.ru/login',
    token: 'https://oauth.mail.ru/token',
    userinfo: {
      async request(context) {
        const res = await fetch(
          `https://oauth.mail.ru/userinfo?access_token=${context.tokens.access_token}`,
        );
        return await res.json();
      },
    },
    profile(profile) {
      return {
        email: profile.email,
        id: profile.id,
        image: profile?.image,
        name: profile.name,
        role: UserRole.STUDENT,
      };
    },
  }),
  VkProvider({
    clientId: process.env.VK_CLIENT_ID as string,
    clientSecret: process.env.VK_CLIENT_SECRET as string,
  }),
];
