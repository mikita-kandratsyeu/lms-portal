'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';

import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type BlockUserModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
  userName?: string | null;
};

type BlockDuration = 'permanent' | 'until-date';

export const BlockUserModal = ({ open, setOpen, userId, userName }: BlockUserModalProps) => {
  const t = useTranslations('owner.users.blockModal');
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<BlockDuration>('permanent');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const isLoading = isFetching || pending;

  useEffect(() => {
    document.body.style.removeProperty('pointer-events');
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setReason('');
    setDuration('permanent');
    setSelectedDate(undefined);
  };

  const handleBlock = async () => {
    if (!reason.trim()) {
      toast({ isError: true, description: t('errors.reasonRequired') });

      return;
    }

    if (duration === 'until-date' && !selectedDate) {
      toast({ isError: true, description: t('errors.dateRequired') });

      return;
    }

    try {
      setIsFetching(true);

      await fetcher.patch(`/api/users/${userId}/block`, {
        body: {
          action: 'block',
          reason: reason.trim(),
          blockedUntil: duration === 'until-date' ? selectedDate?.toISOString() : null,
        },
      });

      toast({ title: t('blockSuccess') });
      handleClose();
      startTransition(() => router.refresh());
    } catch {
      toast({ isError: true, description: t('errors.failed') });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
            {userName && <span className="font-medium text-foreground"> {userName}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="block-reason">{t('reasonLabel')}</Label>
            <Textarea
              id="block-reason"
              placeholder={t('reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="block-duration">{t('durationLabel')}</Label>
            <Select
              value={duration}
              onValueChange={(v) => setDuration(v as BlockDuration)}
              disabled={isLoading}
            >
              <SelectTrigger id="block-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">{t('durationPermanent')}</SelectItem>
                <SelectItem value="until-date">{t('durationUntilDate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {duration === 'until-date' && (
            <div className="flex flex-col gap-2">
              <Label>{t('dateLabel')}</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground',
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : t('dateLabel')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleBlock} disabled={isLoading}>
            {t('confirmBlock')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
