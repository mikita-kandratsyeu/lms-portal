'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { fetcher } from '@/lib/fetcher';

export const AiInsightsModal = () => {
  const t = useTranslations('owner.aiInsights');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>('');

  const handleGenerateInsights = async () => {
    setLoading(true);
    setInsights('');

    try {
      const result = await fetcher.post('/api/payments/ai-insights', {
        responseType: 'json',
        cache: 'no-cache',
      });

      if (result.success) {
        setInsights(result.insights);
      } else {
        setInsights(t('errors.unableToGenerate'));
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights(t('errors.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !insights) {
      handleGenerateInsights();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Sparkles className="h-4 w-4" />
          {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          ) : insights ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-sm text-muted-foreground">{t('generatePrompt')}</p>
              <Button onClick={handleGenerateInsights} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                {t('generateButton')}
              </Button>
            </div>
          )}
        </div>

        {!loading && insights && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button onClick={handleGenerateInsights} variant="outline" size="sm">
              {t('regenerate')}
            </Button>
            <Button onClick={() => setOpen(false)} variant="default" size="sm">
              {t('close')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
