import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { verifyUserEmail } from '@/actions/users/verify-user-email';
import db from '@/lib/db';

import { AdvancedOptions } from './_components/advanced-options/advanced-options';
import { ConnectedAccounts } from './_components/connected-accounts';
import { DeleteAccount } from './_components/delete-account';
import { GeneralSettingsForm } from './_components/general-settings-form';
import { MfaOptions } from './_components/mfa-options/mfa-options';

type SettingsPagePageProps = {
  searchParams: Promise<{ code: string }>;
};

const SettingsPage = async ({ searchParams }: SettingsPagePageProps) => {
  const { code } = await searchParams;

  const t = await getTranslations('settings');

  const user = await getCurrentUser();
  const userInfo = await db.user.findUnique({
    where: { id: user?.userId },
    include: { settings: true, oauth: true },
  });
  const emailVerification = await verifyUserEmail({ user: userInfo, code });

  return (
    <div className="p-4 sm:p-6 flex flex-col mb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">{t('general')}</h1>
        <p className="text-muted-foreground mt-2">{t('generalDescription')}</p>
      </div>

      <div className="max-w-full md:max-w-5xl lg:max-w-6xl space-y-6">
        {userInfo && (
          <>
            <GeneralSettingsForm emailVerification={emailVerification} initialData={userInfo} />
            <AdvancedOptions initialData={userInfo} />
            <MfaOptions initialData={userInfo} />
            {Boolean(userInfo.oauth.length) && <ConnectedAccounts initialData={userInfo} />}
          </>
        )}
        <DeleteAccount userId={user?.userId} email={user?.email} />
      </div>
    </div>
  );
};

export default SettingsPage;
