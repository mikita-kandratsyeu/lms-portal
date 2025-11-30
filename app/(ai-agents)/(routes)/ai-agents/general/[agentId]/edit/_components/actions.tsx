'use client';

import { ChevronDownIcon, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { useConfettiStore } from '@/hooks/store/use-confetti-store';
import { fetcher } from '@/lib/fetcher';

type ActionsProps = {
  agentId: string;
  isDisabled?: boolean;
  isPublished?: boolean;
};

export const Actions = ({ agentId, isDisabled = false, isPublished = false }: ActionsProps) => {
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
        toast({ title: 'Agent unpublished' });
      } else {
        handleOpenConfetti();
        toast({ title: 'Agent has been published' });
      }

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async () => {
    setIsFetching(true);

    try {
      await fetcher.delete(`/api/ai/agents/${agentId}`);

      toast({ title: 'Agent has been deleted' });

      router.push(`/ai-agents/general`);
      router.refresh();
    } catch (error) {
      toast({ isError: true });
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
          disabled={isDisabledButton}
          onClick={() => handleTogglePublication(true)}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="!pl-2" size="sm" disabled={isDisabledButton}>
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onClick={() => handleTogglePublication(false)}
              >
                <span>Publish as private</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ConfirmModal onConfirm={handleDelete}>
        <Button disabled={isFetching} size="sm">
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
