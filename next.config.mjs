import withPlaiceholder from '@plaiceholder/next';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
import npmConfig from './package.json' with { type: 'json' };

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  publicRuntimeConfig: {
    version: npmConfig?.version,
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.storage.yandexcloud.net' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'avatars.yandex.net' },
      { protocol: 'https', hostname: 'filin.mail.ru' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'storage.yandexcloud.net' },
      { protocol: 'https', hostname: 'sun23-2.userapi.com' },
    ],
  },
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          handlebars: 'handlebars/dist/handlebars.js',
        },
      },
    };
  },
  rewrites: async () => {
    return [
      { source: '/ai-agents', destination: '/ai-agents/general' },
      { source: '/settings', destination: '/settings/general' },
    ];
  },
};

export default withPlaiceholder(withNextIntl(nextConfig));
