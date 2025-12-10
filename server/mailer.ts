import nodemailer from 'nodemailer';

import { OWNER_EMAIL } from '@/constants/common';

export const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: OWNER_EMAIL,
    pass: process.env.EMAIL_OWNER_PASSWORD,
  },
});
