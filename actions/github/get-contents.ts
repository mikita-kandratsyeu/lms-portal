'use server';

import { TEN_MINUTE_SEC } from '@/constants/common';
import { PAGE_SIZES } from '@/constants/paginations';
import { fetchCachedData } from '@/lib/cache';
import { fetcher } from '@/lib/fetcher';

type GetGithubContents = {
  pageIndex?: string | number;
  pageSize?: string | number;
  path: string;
};

export const getGithubContents = async ({
  pageIndex = 0,
  pageSize = PAGE_SIZES[0],
  path,
}: GetGithubContents): Promise<string> => {
  try {
    const githubContents = await fetchCachedData(
      `github-contents_path:${path}`,
      async () => {
        const res = await fetcher.get(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}?per_page=${pageSize}&page=${pageIndex}`,
          {
            responseType: 'text',
            headers: {
              Accept: 'application/vnd.github.raw',
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
            cache: 'no-cache',
          },
        );

        return res;
      },
      TEN_MINUTE_SEC,
    );

    return githubContents;
  } catch (error) {
    console.error('[GET_GITHUB_CONTENTS]', error);

    return '';
  }
};
