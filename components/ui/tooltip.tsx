'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const ResponsiveTooltipContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

const Tooltip = ({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <ResponsiveTooltipContext.Provider value={{ isMobile }}>
      {isMobile ? (
        <Drawer {...props}>{children}</Drawer>
      ) : (
        <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
      )}
    </ResponsiveTooltipContext.Provider>
  );
};
Tooltip.displayName = 'Tooltip';

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ children, className, ...props }, ref) => {
  const { isMobile } = React.useContext(ResponsiveTooltipContext);

  if (isMobile) {
    return (
      <DrawerTrigger
        ref={ref}
        asChild
        className={cn('block hover:cursor-pointer', className)}
        {...props}
      >
        {children}
      </DrawerTrigger>
    );
  }

  return (
    <TooltipPrimitive.Trigger ref={ref} className={className} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const { isMobile } = React.useContext(ResponsiveTooltipContext);

  if (isMobile) {
    return (
      <DrawerContent
        ref={ref}
        className={cn(
          'p-2 mb-2 gap-y-1 text-sm',
          className,
          '!left-0 !right-0 !w-full !max-w-none',
        )}
        {...props}
      />
    );
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
