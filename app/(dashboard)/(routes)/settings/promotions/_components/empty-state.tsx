import { TagIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';

export const EmptyState = () => {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Promotions Available</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There are currently no promotion codes available for your account. Check back later for
          new offers!
        </p>
      </div>
    </Card>
  );
};
