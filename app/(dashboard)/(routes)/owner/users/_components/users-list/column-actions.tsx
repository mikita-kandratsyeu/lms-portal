'use client';

import { FileText, MoreHorizontal, ShieldBan, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

import { BlockUserModal } from './block-user-modal';
import { UserReportModal } from './user-report-modal';

type ColumnActionsProps = {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  isPremium?: boolean;
  isBlocked?: boolean | null;
};

export const ColumnActions = ({
  userId,
  userName,
  userEmail,
  userRole,
  isPremium,
  isBlocked,
}: ColumnActionsProps) => {
  const t = useTranslations('owner.users');
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleUnblock = async () => {
    try {
      setIsFetching(true);

      await fetcher.patch(`/api/users/${userId}/block`, {
        body: { action: 'unblock' },
      });

      toast({ title: t('blockModal.unblockSuccess') });
      startTransition(() => router.refresh());
    } catch {
      toast({ isError: true, description: t('blockModal.errors.unblockFailed') });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-4 w-8 p-0" variant="ghost">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => setReportModalOpen(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {t('reportModal.viewReport')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isBlocked ? (
            <DropdownMenuItem
              className="hover:cursor-pointer text-green-600 focus:text-green-600"
              onClick={handleUnblock}
              disabled={isFetching || pending}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {t('blockModal.unblockUser')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="hover:cursor-pointer text-destructive focus:text-destructive"
              onClick={() => setBlockModalOpen(true)}
            >
              <ShieldBan className="h-4 w-4 mr-2" />
              {t('blockModal.blockUser')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <UserReportModal
        open={reportModalOpen}
        setOpen={setReportModalOpen}
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        isPremium={isPremium}
      />
      <BlockUserModal
        open={blockModalOpen}
        setOpen={setBlockModalOpen}
        userId={userId}
        userName={userName}
      />
    </>
  );
};
