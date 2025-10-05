'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  Button,
  Command,
  CommandGroup,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/constants/auth';
import { fetcher } from '@/lib/fetcher';
import { capitalize, cn } from '@/lib/utils';

type RoleActionsProps = {
  userId: string;
  role: string;
};

export const RoleActions = ({ userId, role }: RoleActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [isFetching, setIsFetching] = useState(false);

  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(role);

  const handleAction = async (newRole: string) => {
    try {
      setIsFetching(true);

      await fetcher.patch(`/api/users/${userId}`, {
        body: {
          notification: {
            title: 'Profile changes',
            body: `Your user role has been updated with "${capitalize(role)}" on "${capitalize(newRole)}". The changes will take effect in 10 minutes.`,
          },
          role: newRole,
        },
      });

      toast({ title: 'User updated' });
      startTransition(() => router.refresh());
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-[180px] justify-between truncate"
          disabled={isFetching || pending}
        >
          {capitalize(role)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {Object.values(UserRole).map((role) => (
              <CommandItem
                key={role}
                value={role}
                onSelect={async (newRole) => {
                  setOpen(false);

                  await handleAction(newRole);
                  setCurrentRole(newRole);
                }}
              >
                <Check
                  className={cn('mr-2 h-4 w-4', currentRole === role ? 'opacity-100' : 'opacity-0')}
                />
                {capitalize(role)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
