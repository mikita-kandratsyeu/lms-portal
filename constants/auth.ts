export enum Provider {
  GOOGLE = 'google',
  YANDEX = 'yandex',
  VK = 'vk',
  MAILRU = 'mailru',
  LINKEDIN = 'linkedin',
  SLACK = 'slack',
  GITHUB = 'github',
  CREDENTIALS = 'credentials',
}

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export const enum AuthStatus {
  LOADING = 'loading',
}

export const OAUTH_LABELS = {
  [Provider.GITHUB]: 'GitHub',
  [Provider.LINKEDIN]: 'LinkedIn',
  [Provider.YANDEX]: 'Yandex ID',
  [Provider.VK]: 'VK ID',
  [Provider.MAILRU]: 'Mail',
} as Record<Provider, string>;

export const MAX_OAUTH_IN_ROW = 4;
export const PASSWORD_VALIDATION = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{4,}$/);
export const OAUTH = 'oauth';
