'use client';

import { CsmCategory, CsmStatus } from '@prisma/client';
import { format } from 'date-fns/format';
import { AlertCircle, Calendar, CheckCircle2, Clock, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { Badge } from '@/components/ui';
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
  editIssue?: CsmIssueType | null;
  open: boolean;
  setOpen: (value: boolean) => void;
};

const getStatusConfig = (status: CsmStatus) => {
  switch (status) {
    case CsmStatus.new:
      return {
        label: 'New',
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-orange-600',
      };
    case CsmStatus.progress:
      return {
        label: 'In Progress',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-yellow-600',
      };
    case CsmStatus.done:
      return {
        label: 'Resolved',
        variant: 'default' as const,
        icon: CheckCircle2,
        color: 'text-green-600',
      };
    default:
      return {
        label: capitalize(status),
        variant: 'outline' as const,
        icon: AlertCircle,
        color: 'text-gray-600',
      };
  }
};

export const CsmModal = ({ categories = [], editIssue, open, setOpen }: CsmModalProps) => {
  const t = useTranslations('csm-modal');

  const statusConfig = editIssue ? getStatusConfig(editIssue.status) : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogContent
          className={cn(
            'sm:max-w-[600px] max-h-[90vh] overflow-y-auto max-w-[95vw] flex flex-col justify-start',
            editIssue && 'sm:min-w-[600px]',
          )}
        >
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-lg sm:text-xl leading-tight pr-8">
              {editIssue ? editIssue.name : t('title')}
            </DialogTitle>
            <DialogDescription>
              {editIssue ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {statusConfig && StatusIcon && (
                      <Badge
                        variant={statusConfig.variant}
                        className="flex items-center gap-1 w-fit"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    )}
                    {editIssue.category && (
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {t(`categories.${editIssue.category.name}`)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Created {format(editIssue.createdAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}
                      </span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Updated {format(editIssue.updatedAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                t('body')
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {editIssue && <EditForm editIssue={editIssue} callback={() => setOpen(false)} />}
            {!editIssue && <CreateForm categories={categories} callback={() => setOpen(false)} />}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
