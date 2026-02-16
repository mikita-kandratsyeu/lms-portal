import { type ClassValue, clsx } from 'clsx';
import { AES, enc } from 'crypto-js';
import { twMerge } from 'tailwind-merge';

import { BATCH_SIZE } from '@/constants/paginations';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';

  const s = String(str);
  return s.length <= maxLength ? s : `${s.slice(0, maxLength)}...`;
};

export const getFallbackName = (fullName: string) => {
  const [firstname, lastname] = fullName.split(' ');

  return `${capitalize(firstname)[0]}${lastname ? capitalize(lastname)[0] : ''}`;
};

export const hasJsonStructure = (str: string) => {
  if (typeof str !== 'string') return false;

  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch {
    return false;
  }
};

export function getRandomInt(min: number, max: number) {
  const byteArray = new Uint8Array(1);
  crypto.getRandomValues(byteArray);

  const range = max - min + 1;
  const max_range = 256;

  if (byteArray[0] >= Math.floor(max_range / range) * range) {
    return getRandomInt(min, max);
  }

  return min + (byteArray[0] % range);
}

export const encrypt = <T>(value: T, secret: string) => {
  const cipher = AES.encrypt(JSON.stringify(value), secret).toString();

  return cipher;
};

export const decrypt = (cipher: string, secret: string) => {
  const bytes = AES.decrypt(cipher, secret);

  return bytes.toString(enc.Utf8);
};

export const absoluteUrl = (path: string) => `${process.env.NEXT_PUBLIC_APP_URL}${path}`;

export const isValidUrl = (value: string) => {
  try {
    new URL(value);

    return true;
  } catch {
    return false;
  }
};

export const splitIntoWords = (sentence: string) => {
  const cleanSentence = sentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

  return cleanSentence.split(/\s+/);
};

export const base64ToBlob = (base64: string, contentType: string = '') => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length).fill(0);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: contentType });
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getBatchedItems = <T>(items: T[]) =>
  items.reduce(
    (batches, item, index) => {
      const batchIndex = Math.floor(index / BATCH_SIZE);

      batches[batchIndex] ??= [];

      if (item) {
        batches[batchIndex].push(item);
      }

      return batches;
    },
    [] as (typeof items)[],
  );

export const extractValidJson = (input: string) => {
  const jsonRegex = /{(?:[^{}]|(?:{(?:[^{}]|(?:{[^{}]*}))*}))*}/;

  const match = input.match(jsonRegex);
  if (match) {
    return match[0];
  }
  return null;
};

export const maskEmail = (email: string) => {
  const [localPart, domainPart] = email.split('@');

  if (!localPart || !domainPart || domainPart.indexOf('.') === -1) {
    throw new Error('Incorrect email address');
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];

  const maskedLocalPart =
    localPart.length > 2 ? firstChar + '*'.repeat(localPart.length - 2) + lastChar : localPart;

  const domainParts = domainPart.split('.');
  const primaryDomain = domainParts[0];
  const topLevelDomain = domainParts.slice(1).join('.');

  const maskedPrimaryDomain =
    primaryDomain.length > 2
      ? primaryDomain[0] +
        '*'.repeat(primaryDomain.length - 2) +
        primaryDomain[primaryDomain.length - 1]
      : primaryDomain;

  return `${maskedLocalPart}@${maskedPrimaryDomain}.${topLevelDomain}`;
};

export const readFile = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
};
