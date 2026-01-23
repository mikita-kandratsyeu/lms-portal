'use client';

import { ChevronDownIcon, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { AGENT_ACTION } from '@/constants/ai/general';
import { useConfettiStore } from '@/hooks/store/use-confetti-store';
import { fetcher } from '@/lib/fetcher';

type ActionsProps = {
  agentId: string;
  isConnected?: boolean;
  isDefault?: boolean | null;
  isDisabled?: boolean;
  isOwner?: boolean;
  isPreviewPage?: boolean;
  isPublished?: boolean;
};

export const Actions = ({
  agentId,
  isConnected = false,
  isDefault = false,
  isDisabled = false,
  isOwner = false,
  isPreviewPage = false,
  isPublished = false,
}: ActionsProps) => {
  const t = useTranslations('ai-agents.actions');
  const { toast } = useToast();

  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleOpenConfetti = useConfettiStore((state) => state.onOpen);

  const handleTogglePublication = async (isPublic = false) => {
    setIsFetching(true);

    try {
      await fetcher.patch(`/api/ai/agents/${agentId}/${isPublished ? 'unpublish' : 'publish'}`, {
        body: { isPublic },
      });

      if (isPublished) {
        toast({ title: t('toast.unpublished') });
      } else {
        handleOpenConfetti();

        toast({
          title: t('toast.published'),
          type: 'success',
        });
      }

      router.refresh();
    } catch (error) {
      console.error('[AGENT_PUBLICATION]', error);

      toast({
        isError: true,
        description: (error as Error)?.message,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async () => {
    setIsFetching(true);

    try {
      await fetcher.delete(`/api/ai/agents/${agentId}`);

      toast({ title: t('toast.deleted'), type: 'warning' });

      router.push('/ai-agents/general');
      router.refresh();
    } catch (error) {
      console.error('[AGENT_DELETE]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleConnection = async () => {
    setIsFetching(true);

    try {
      await fetcher.post(`/api/ai/agents/${agentId}/connection`, {
        body: { action: isConnected ? AGENT_ACTION.DISCONNECT : AGENT_ACTION.CONNECT },
      });

      toast({
        title: isConnected ? t('toast.disconnected') : t('toast.connected'),
        type: isConnected ? 'warning' : 'success',
      });

      router.refresh();
    } catch (error) {
      console.error('[AGENT_CONNECTION]', error);

      toast({
        isError: true,
        description: (error as Error)?.message,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleClone = async () => {
    setIsFetching(true);

    try {
      const response = await fetcher.post(`/api/ai/agents/${agentId}/clone`, {
        responseType: 'json',
      });

      if (response?.id) {
        router.push(`/ai-agents/general/${response.id}`);
      } else {
        toast({
          isError: true,
        });
      }
    } catch (error) {
      console.error('[AGENT_CLONE]', error);

      toast({
        isError: true,
        description: (error as Error)?.message,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const isDisabledButton = isDisabled || isFetching;

  return (
    <div className="flex items-center gap-x-2">
      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabledButton || (isPreviewPage && Boolean(isDefault))}
          onClick={() => (isPreviewPage ? handleConnection() : handleTogglePublication(true))}
        >
          {isPreviewPage && (
            <span>{isConnected || isDefault ? t('disconnect') : t('connect')}</span>
          )}
          {!isPreviewPage && isPublished && <span>{t('unpublish')}</span>}
          {!isPreviewPage && !isPublished && <span>{t('publish')}</span>}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="!pl-2"
              disabled={isDisabledButton || (!isPreviewPage && isPublished)}
              size="sm"
              variant="outline"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {!isPreviewPage && (
                <DropdownMenuItem
                  className="hover:cursor-pointer"
                  onClick={() => handleTogglePublication(false)}
                >
                  <span>{t('publishPrivate')}</span>
                </DropdownMenuItem>
              )}
              {isPreviewPage && (
                <>
                  <DropdownMenuItem
                    className="hover:cursor-pointer"
                    disabled={!isConnected && !isDefault}
                    onClick={() => {
                      if (isConnected || isDefault) {
                        router.push(`/chat?agentId=${agentId}`);
                      }
                    }}
                  >
                    <span>{t('chatNow')}</span>
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={() => router.push(`/ai-agents/general/${agentId}/edit`)}
                      >
                        <span>{t('edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:cursor-pointer" onClick={handleClone}>
                        <span>{t('clone')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      {isOwner && !isDefault && (
        <ConfirmModal onConfirm={handleDelete}>
          <Button disabled={isFetching} size="sm">
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </ConfirmModal>
      )}
    </div>
  );
};
