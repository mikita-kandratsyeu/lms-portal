'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useEffect, useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

import { Button, Input } from '../ui';

type DeleteAccountModalProps = {
  email?: string | null;
  open: boolean;
  setOpen: (value: boolean) => void;
  userId?: string;
};

export const DeleteAccountModal = ({ email, open, setOpen, userId }: DeleteAccountModalProps) => {
  const t = useTranslations('delete-acc-modal');

  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(input === email);
  }, [email, input]);

  const handleDelete = async (event: SyntheticEvent) => {
    event.preventDefault();

    setIsFetching(true);

    try {
      await fetcher.delete(`/api/users/${userId}`);

      signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('[DELETE-ACCOUNT-MODAL]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleDelete}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('body')}</DialogDescription>
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: t.markup('confirmEmail', { strong: () => `<strong>${email}</strong>` }),
              }}
            />
          </DialogHeader>
          <div className="w-full my-4">
            <div>
              <Input
                disabled={isFetching}
                name="price"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="mt-2">
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button
              className="mt-2"
              disabled={isFetching || !isValid}
              isLoading={isFetching}
              type="submit"
              variant="destructive"
            >
              {t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
