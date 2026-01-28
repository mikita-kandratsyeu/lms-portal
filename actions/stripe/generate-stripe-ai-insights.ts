'use server';

import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';

import { generateCompletion } from '@/actions/ai/common/generate-completion';
import { ChatCompletionRole } from '@/constants/ai/general';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { getStripeAnalytics } from './get-stripe-analytics';

export const generateStripeAiInsights = async () => {
  try {
    const analytics = await getStripeAnalytics();
    const defaultLocale = { locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY };

    const subscriptionPlansBreakdown = analytics.revenue.subscriptions.plans
      .map(
        (plan) =>
          `  • ${plan.name} (${plan.period}): ${plan.activeCount} active subscriptions, ${formatPrice(getConvertedPrice(plan.revenue), defaultLocale)} revenue`,
      )
      .join('\n');

    const prompt = `Analyze the following business metrics from our LMS platform and provide actionable insights:

**Financial Balances:**
- Available Balance: ${formatPrice(getConvertedPrice(analytics.balances.available), defaultLocale)}
- Pending Balance: ${formatPrice(getConvertedPrice(analytics.balances.pending), defaultLocale)}

**User Metrics:**
- Total Customers: ${analytics.customers.total.toLocaleString()}
- Total Instructors: ${analytics.instructors.total.toLocaleString()}

**Revenue Breakdown:**
- Subscriptions: ${analytics.revenue.subscriptions.count} total (${analytics.revenue.subscriptions.active} active)
  Revenue: ${formatPrice(getConvertedPrice(analytics.revenue.subscriptions.amount), defaultLocale)}
${subscriptionPlansBreakdown ? `  Plans Breakdown:\n${subscriptionPlansBreakdown}` : ''}
- Course Sales: ${analytics.revenue.sales.count} purchases totaling ${formatPrice(getConvertedPrice(analytics.revenue.sales.amount), defaultLocale)}
- Total Revenue: ${formatPrice(getConvertedPrice(analytics.revenue.total), defaultLocale)}

**Payouts:**
- Total Paid Out: ${formatPrice(getConvertedPrice(analytics.payouts.total), defaultLocale)}
- Recent Payout Requests: ${analytics.payouts.recent}

Please provide:
1. Overall business health assessment
2. Key trends and patterns (especially subscription plans performance)
3. Areas of concern or opportunity
4. Actionable recommendations for growth
5. Financial health indicators

Keep the analysis concise and focused on actionable insights.`;

    const result = await generateCompletion({
      input: [
        {
          role: ChatCompletionRole.USER as unknown as ChatCompletionUserMessageParam['role'],
          content: prompt,
        },
      ],
      instructions:
        'You are a business analytics expert specializing in LMS platforms and SaaS financial metrics. Provide clear, actionable insights based on the data provided.',
    });

    if (!result.completion) {
      return {
        success: false,
        insights: 'Unable to generate insights at this time. Please try again later.',
      };
    }

    const insightsText =
      (result.completion as any).output_text ??
      (result.completion as any).choices?.[0]?.message?.content ??
      '';

    return {
      success: true,
      insights: insightsText,
    };
  } catch (error) {
    console.error('[GENERATE_STRIPE_AI_INSIGHTS_ACTION]', error);

    return {
      success: false,
      insights: 'Error generating insights. Please try again.',
    };
  }
};
