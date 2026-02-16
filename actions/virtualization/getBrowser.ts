'use server';

import * as puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';

const CHROMIUM_PACK_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar';

export const getBrowser = async () => {
  if (process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium-min')).default;

    return await puppeteerCore.launch({
      headless: true,
      args: chromium.args,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
    });
  }

  return await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  });
};
