'use server';

import { promises as fs } from 'fs';

import { getGithubContents } from '../github/get-contents';

export const getEmailTemplate = async (template: string) => {
  try {
    const content =
      process.env.NODE_ENV === 'development'
        ? await fs.readFile(`${process.cwd()}/email-templates/${template}.html`, 'utf8')
        : await getGithubContents({ path: `email-templates/${template}.html` });

    return content;
  } catch (error) {
    console.error('[GET_EMAIL_TEMPLATE_ACTION]', error);

    return '';
  }
};
