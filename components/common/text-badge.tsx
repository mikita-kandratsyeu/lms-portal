import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { Badge } from '../ui';

const backgroundVariants = cva('border', {
  variants: {
    variant: {
      default: 'bg-neutral-100 dark:bg-neutral-700 border-neutral-500',
      green: 'bg-green-100 dark:bg-green-900 border-green-300',
      indigo: 'bg-indigo-100 dark:bg-indigo-800 border-indigo-400',
      lime: 'bg-lime-400/20 dark:bg-lime-400/10 border-lime-400',
      red: 'bg-red-100 dark:bg-red-900 border-red-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-700 border-yellow-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-neutral-800 dark:text-neutral-300',
      green: 'text-green-800 dark:text-green-300',
      indigo: 'text-indigo-800 dark:text-indigo-300',
      lime: 'text-lime-700 dark:text-lime-300',
      red: 'text-red-800 dark:text-red-300',
      yellow: 'text-yellow-800 dark:text-yellow-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BackgroundVariantsProps = VariantProps<typeof backgroundVariants>;
export type TextVariantsProps = VariantProps<typeof textVariants>;

interface IconBadgeProps extends BackgroundVariantsProps, TextVariantsProps {
  className?: string;
  label: string;
}

const TextBadge = ({ variant, label, className }: IconBadgeProps) => {
  return (
    <Badge
      className={cn(backgroundVariants({ variant }), 'whitespace-nowrap', className)}
      variant="outline"
    >
      <span className={cn(textVariants({ variant }))}>{label}</span>
    </Badge>
  );
};

TextBadge.displayName = 'TextBadge';

export { TextBadge };
