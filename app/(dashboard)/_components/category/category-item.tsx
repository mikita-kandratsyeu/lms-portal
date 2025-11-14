'use client';

import { Button } from '@/components/ui';
import { useCourseStore } from '@/hooks/store/use-course-store';
import { cn } from '@/lib/utils';

type CategoryItemProps = {
  label: string;
  value?: string;
};

export const CategoryItem = ({ label, value = 'all' }: CategoryItemProps) => {
  const { categoryIds, removeCategoryId, resetCategoryIds, setCategoryId } = useCourseStore();

  const isSelected = categoryIds.includes(value) || (value === 'all' && !categoryIds?.length);

  const handleClick = () => {
    if (value === 'all') {
      resetCategoryIds();
    } else if (isSelected) {
      removeCategoryId(value);
    } else {
      setCategoryId(value);
    }
  };

  return (
    <Button
      className={cn(
        'py-2 px-3 text-sm/6 border rounded-lg flex items-center transition duration-300 space-x-1 font-semibold',
        isSelected &&
          'bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20',
      )}
      variant="outline"
      onClick={handleClick}
    >
      <div className="truncate">{label}</div>
    </Button>
  );
};
