'use client';

import { KeyRound, Link, MoreHorizontal, Pencil, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiLoaderAlt } from 'react-icons/bi';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { CsmModal } from '@/components/modals/csm/csm-modal';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { absoluteUrl } from '@/lib/utils';

type ColumnActionsProps = {
  csmId: string;
  csmIssue: CsmIssueType;
};

export const ColumnActions = ({ csmId, csmIssue }: ColumnActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    document.body.style.removeProperty('pointer-events');
  }, [openModal]);

  const handleAction = (action: 'edit' | 'remove' | 'link' | 'key') => async () => {
    try {
      setIsFetching(true);

      if (action === 'edit') {
        setOpenModal(true);
      }

      if (action === 'link') {
        navigator.clipboard.writeText(absoluteUrl(`owner/csm?issueId=${csmIssue.id}`));
      }

      if (action === 'key') {
        navigator.clipboard.writeText(csmIssue.name);
      }

      if (action === 'remove') {
        const response = await fetcher.delete(`/api/csm/${csmId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`Failed to delete CSM issue: ${response.status} ${errorText}`);
        }

        const responseJson = await response.json();

        toast({ title: `${responseJson?.name} has been removed.` });
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      {openModal && <CsmModal open={openModal} setOpen={setOpenModal} editIssue={csmIssue} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-4 w-8 p-0" variant="ghost" disabled={isFetching}>
            {isFetching && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
            {!isFetching && (
              <>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('edit')}>
            <Pencil className="h-4 w-4  mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('link')}>
            <Link className="h-4 w-4  mr-2" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('key')}>
            <KeyRound className="h-4 w-4  mr-2" />
            Copy key
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer text-red-500"
            onClick={handleAction('remove')}
          >
            <XCircle className="h-4 w-4  mr-2" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
