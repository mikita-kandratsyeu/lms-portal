import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getLoginQuote } from '@/actions/auth/get-login-quote';
import { AuthForm } from '@/components/auth/auth-form';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { Logo } from '@/components/common/logo';
import { MadeWithLove } from '@/components/common/made-with-love';
import { ThemeSwitcher } from '@/components/common/theme-switcher';
import { Button } from '@/components/ui';

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { callbackUrl } = await searchParams;

  const user = await getCurrentUser();

  if (user?.userId) {
    return redirect('/');
  }

  const { author, quote } = await getLoginQuote();

  const t = await getTranslations('signIn');

  return (
    <div className="container relative max-w-[445px] h-full flex flex-col items-center sm:justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-[url('/assets/login-bg.svg')] bg-no-repeat bg-cover" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo onlyDarkMode />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;{quote ?? t('quoteBody')}&rdquo;</p>
            <footer className="text-sm">{author ?? t('quoteAuthor')}</footer>
          </blockquote>
          <p className="text-xs mt-2 text-muted-foreground">{t('generated')}</p>
          <MadeWithLove className="mt-2 text-xs" />
        </div>
      </div>
      <div className="lg:p-8 my-12">
        <div className="mx-auto flex w-full flex-col justify-center sm:space-y-6 space-y-4 sm:w-[350px]">
          <Link href="/" className="w-fit -ml-2">
            <Button variant="ghost" size="sm" className="w-full">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          <AuthForm callbackUrl={callbackUrl} />
        </div>
        <div className="hidden lg:left-auto lg:mr-6 text-muted-foreground gap-y-4 fixed right-0 left-0 bottom-0 md:flex justify-center text-xs gap-x-2 lg:mb-10 mb-14">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <div className="lg:hidden fixed right-0 left-0 bottom-0 flex justify-center text-xs mb-4">
          <MadeWithLove />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
