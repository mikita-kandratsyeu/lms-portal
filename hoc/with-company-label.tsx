import type { NextPage } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const withCompanyLabel =
  <T extends object>(WrappedComponent: NextPage<T>) =>
  async (props: T) => {
    const t = await getTranslations('app');

    return (
      <>
        <WrappedComponent {...props} />
        <Link href="/" target="_blank">
          <div className="absolute flex justify-center items-center mb-8 bottom-0 gap-x-1 w-full text-xs text-muted-foreground">
            {t('poweredBy')}
            <div className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-x-1">
              <span>{t('name')}</span>
            </div>
          </div>
        </Link>
      </>
    );
  };

export default withCompanyLabel;
