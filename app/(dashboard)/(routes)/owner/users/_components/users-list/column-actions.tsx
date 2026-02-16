'use client';

import { FileText, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';

import { UserReportModal } from './user-report-modal';

type ColumnActionsProps = {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  isPremium?: boolean;
};

export const ColumnActions = ({
  userId,
  userName,
  userEmail,
  userRole,
  isPremium,
}: ColumnActionsProps) => {
  const t = useTranslations('owner.users.reportModal');
  const [reportModalOpen, setReportModalOpen] = useState(false);

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
            {t('viewReport')}
          </DropdownMenuItem>
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
    </>
  );
};
