import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { PLATFORM_DESCRIPTION } from '@/constants/common';
import { isBusinessOwner } from '@/lib/owner';

export const metadata: Metadata = {
  title: 'Owner',
  description: PLATFORM_DESCRIPTION,
};

type OwnerLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const OwnerLayout = async ({ children }: OwnerLayoutProps) => {
  const user = await getCurrentUser();

  if (!isBusinessOwner(user?.userId)) {
    return redirect('/');
  }

  return <>{children}</>;
};

export default OwnerLayout;
