'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';

import { generateCompletion } from '@/actions/ai/common/generate-completion';
import { ChatCompletionRole } from '@/constants/ai/general';
import { TEN_MINUTE_SEC } from '@/constants/common';
import { SUPPORTED_LOCALES } from '@/constants/locale';
import { fetchCachedData } from '@/lib/cache';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { getStripeAnalytics } from './get-stripe-analytics';

export const generateStripeAiInsights = async () => {
  const locale = await getLocale();
  const t = await getTranslations('error');

  const languageName = SUPPORTED_LOCALES.find(({ key }) => key === locale)?.title || 'English';
  const cacheKey = `stripe_ai_insights_${locale}`;

  try {
    const result = await fetchCachedData(
      cacheKey,
      async () => {
        const analytics = await getStripeAnalytics();

        const subscriptionPlansBreakdown = analytics.revenue.subscriptions.plans
          .map(
            (plan) =>
              `  • ${plan.name} (${plan.period}): ${plan.activeCount} active subscriptions, ${formatPrice(getConvertedPrice(plan.revenue))} revenue`,
          )
          .join('\n');

        const prompt = `Analyze the following business metrics from our LMS platform and provide actionable insights:

**Financial Balances:**
- Available Balance: ${formatPrice(getConvertedPrice(analytics.balances.available))}
- Pending Balance: ${formatPrice(getConvertedPrice(analytics.balances.pending))}

**User Metrics:**
- Total Customers: ${analytics.customers.total.toLocaleString()}
- Total Instructors: ${analytics.instructors.total.toLocaleString()}

**Revenue Breakdown:**
- Subscriptions: ${analytics.revenue.subscriptions.count} total (${analytics.revenue.subscriptions.active} active)
  Revenue: ${formatPrice(getConvertedPrice(analytics.revenue.subscriptions.amount))}
${subscriptionPlansBreakdown ? `  Plans Breakdown:\n${subscriptionPlansBreakdown}` : ''}
- Course Sales: ${analytics.revenue.sales.count} purchases totaling ${formatPrice(getConvertedPrice(analytics.revenue.sales.amount))}
- Total Revenue: ${formatPrice(getConvertedPrice(analytics.revenue.total))}

**Payouts:**
- Total Paid Out: ${formatPrice(getConvertedPrice(analytics.payouts.total))}
- Recent Payout Requests: ${analytics.payouts.recent}

Please provide:
1. Overall business health assessment
2. Key trends and patterns (especially subscription plans performance)
3. Areas of concern or opportunity
4. Actionable recommendations for growth
5. Financial health indicators

IMPORTANT: Respond in ${languageName} language. Keep the analysis concise and focused on actionable insights.`;

        const aiResult = await generateCompletion({
          input: [
            {
              role: ChatCompletionRole.USER as unknown as ChatCompletionUserMessageParam['role'],
              content: prompt,
            },
          ],
          instructions: `You are a business analytics expert specializing in LMS platforms and SaaS financial metrics. Provide clear, actionable insights based on the data provided. IMPORTANT: You MUST respond in ${languageName} language. All analysis, recommendations, and insights must be written in ${languageName}.`,
        });

        if (!aiResult.completion) {
          throw new Error('No completion received from AI');
        }

        const insightsText =
          (aiResult.completion as any).output_text ??
          (aiResult.completion as any).choices?.[0]?.message?.content ??
          '';

        return {
          success: true,
          insights: insightsText,
        };
      },
      TEN_MINUTE_SEC,
    );

    return result;
  } catch (error) {
    console.error('[GENERATE_STRIPE_AI_INSIGHTS_ACTION]', error);

    return {
      success: false,
      insights: t('body'),
    };
  }
};
