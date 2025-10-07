import { CsmCategory, CsmStatus } from '@prisma/client';

import { TextVariantsProps } from '@/components/common/text-badge';

export const getSortedCategories = (categories: CsmCategory[]) => {
  const otherCategory = categories.find((ct) => ct.name === 'other');
  const sortedCategories = categories.filter((ct) => ct.name !== 'other');

  return otherCategory ? [...sortedCategories, otherCategory] : sortedCategories;
};

export const getStatusLabelStyle = (
  status: CsmStatus,
): { label: string; variant: TextVariantsProps['variant'] } => {
  if (status === CsmStatus.new) {
    return {
      label: 'New',
      variant: 'indigo',
    };
  }

  if (status === CsmStatus.progress) {
    return {
      label: 'In Progress',
      variant: 'indigo',
    };
  }

  return {
    label: 'Done',
    variant: 'green',
  };
};
