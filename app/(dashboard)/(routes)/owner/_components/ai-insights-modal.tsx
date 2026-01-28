'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { generateStripeAiInsights } from '@/actions/stripe/generate-stripe-ai-insights';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';

export const AiInsightsModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>('');

  const handleGenerateInsights = async () => {
    setLoading(true);
    setInsights('');

    try {
      const result = await generateStripeAiInsights();

      if (result.success) {
        setInsights(result.insights);
      } else {
        setInsights('Unable to generate insights. Please try again later.');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('An error occurred while generating insights.');
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
          AI Analytics Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Business Insights
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of your business metrics powered by artificial intelligence
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Analyzing your business data and generating insights...
              </p>
            </div>
          ) : insights ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to generate insights
              </p>
              <Button onClick={handleGenerateInsights} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </div>
          )}
        </div>

        {!loading && insights && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button onClick={handleGenerateInsights} variant="outline" size="sm">
              Regenerate
            </Button>
            <Button onClick={() => setOpen(false)} variant="default" size="sm">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
