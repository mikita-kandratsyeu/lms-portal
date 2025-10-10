'use client';

import { CsmCategory } from '@prisma/client';
import { format } from 'date-fns/format';
import { useTranslations } from 'next-intl';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { TIMESTAMP_USER_PROFILE_TEMPLATE } from '@/constants/common';
import { capitalize, cn } from '@/lib/utils';

import { CreateForm } from './create-form';
import { EditForm } from './edit-form';

type CsmModalProps = {
  categories?: CsmCategory[];
  editIssue?: CsmIssueType;
  open: boolean;
  setOpen: (value: boolean) => void;
};

export const CsmModal = ({ categories = [], editIssue, open, setOpen }: CsmModalProps) => {
  const t = useTranslations('csm-modal');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogContent
          className={cn(
            'sm:max-w-[525px] sm:max-h-[625px] overflow-auto max-w-max sm:h-auto h-full sm:w-auto w-full flex flex-col justify-start pt-6',
            editIssue && 'min-w-[525px]',
          )}
        >
          <DialogHeader>
            <DialogTitle>{editIssue ? editIssue.name : t('title')}</DialogTitle>
            <DialogDescription>
              {editIssue ? (
                <div className="mt-2 text-sm flex justify-between items-center gap-x-6">
                  <div className="flex flex-col">
                    <p className="font-medium">
                      {capitalize(editIssue?.category?.name ?? 'Unknown')}
                    </p>
                    <p className="line-clamp-2">
                      {t(`categories.${editIssue?.category?.name ?? ''}`)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-y-1 text-xs items-end">
                    <p>Created at {format(editIssue.createdAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}</p>
                    <p>Updated at {format(editIssue.updatedAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}</p>
                  </div>
                </div>
              ) : (
                t('body')
              )}
            </DialogDescription>
          </DialogHeader>
          {editIssue && <EditForm editIssue={editIssue} />}
          {!editIssue && <CreateForm categories={categories} callback={() => setOpen(false)} />}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
