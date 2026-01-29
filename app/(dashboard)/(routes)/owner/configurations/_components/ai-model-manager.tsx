'use client';

import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

import { AiModelDialog } from './ai-model-dialog';

type AiModel = {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  value: string;
  features: string[];
  isDefault: boolean;
  isSubscription: boolean;
  _count: {
    aiAgents: number;
  };
};

export const AiModelManager = () => {
  const [models, setModels] = useState<AiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AiModel | null>(null);

  const t = useTranslations('owner.configurations.aiModels');
  const tCommon = useTranslations('owner.configurations.common');
  const { toast } = useToast();

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetcher.get('/api/configurations/ai-model', { responseType: 'json' });
      setModels(response);
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
      toast({ title: t('messages.loadError'), isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete', { item: t('title').toLowerCase() }))) {
      return;
    }

    try {
      await fetcher.delete(`/api/configurations/ai-model/${id}`, { responseType: 'json' });
      toast({ title: t('messages.deleteSuccess'), type: 'success' });
      fetchModels();
    } catch (error) {
      console.error('Failed to delete AI model:', error);
      toast({ title: t('messages.deleteError'), isError: true });
    }
  };

  const handleEdit = (model: AiModel) => {
    setEditingItem(model);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    fetchModels();
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button onClick={handleCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {tCommon('addNew')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
          </div>
        ) : models.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
            <Button onClick={handleCreate} variant="outline" size="sm" className="mt-4">
              {tCommon('createFirst', { item: t('title').toLowerCase() })}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('name')}</TableHead>
                  <TableHead>{t('provider')}</TableHead>
                  <TableHead>{t('value')}</TableHead>
                  <TableHead>{t('features')}</TableHead>
                  <TableHead>{t('agents')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.providerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{model.value}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {model.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {model.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{model.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{model._count.aiAgents}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {model.isDefault && (
                          <Badge variant="default" className="text-xs">
                            {t('default')}
                          </Badge>
                        )}
                        {model.isSubscription && (
                          <Badge variant="outline" className="text-xs">
                            {t('premium')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(model)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(model.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={model._count.aiAgents > 0}
                          title={
                            model._count.aiAgents > 0
                              ? tCommon('cannotDeleteInUse', {
                                  item: t('title').toLowerCase(),
                                  related: t('agents').toLowerCase(),
                                })
                              : undefined
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <AiModelDialog isOpen={isDialogOpen} onClose={handleDialogClose} editingItem={editingItem} />
    </Card>
  );
};
