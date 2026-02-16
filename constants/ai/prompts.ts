import { TEXTAREA_MAX_LENGTH } from '../courses';

export const SYSTEM_COURSE_PROMPT =
  'You are an expert course creator and educator on a specialized learning platform.';

export const SYSTEM_TRANSLATE_PROMPT =
  'You are a professional translator with deep knowledge of languages and cultures.';

export const SYSTEM_CONVERSATION_STARTERS_PROMPT =
  'You are an expert in writing UX texts for AI assistants. Figure out how to start a short friendly conversation on behalf of the user.';

export const USER_COURSE_SHORT_DESCRIPTION_PROMPT = (originalDescription: string) =>
  `Rewrite the following course description using different words: "${originalDescription}". Ensure the new description is concise and engaging. Limit the output to ${Math.round(TEXTAREA_MAX_LENGTH / 1.4)} characters.`;

export const USER_CHAPTER_DESCRIPTION_PROMPT = (originalDescription: string) =>
  `Rewrite the following chapter description using different wording: "${originalDescription}". Provide the new description in plain text without any formatting or HTML tags.`;

export const USER_TRANSLATE_PROMPT = (originalText: string, targetLanguage: string) =>
  `Translate the following text into ${targetLanguage}: "${originalText}". Provide only the translated text, without quotation marks or additional comments.`;

export const USER_CONVERSATION_STARTERS_PROMPT = ({
  agentName,
  agentDescription,
  systemInstruction,
  limit,
}: {
  agentName?: string | null;
  agentDescription?: string | null;
  systemInstruction?: string | null;
  limit: number;
}) => {
  const context = [
    agentName ? `Agent name: ${agentName}` : null,
    agentDescription ? `Agent description: ${agentDescription}` : null,
    systemInstruction ? `System instruction: ${systemInstruction}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `Generate ${limit} short conversation starters for an AI assistant on behalf of the user.
${context ? `Context:\n${context}\n` : ''}Return JSON only, with this exact structure:
{
  "en": ["string", "..."],
  "ru": ["string", "..."],
  "be": ["string", "..."]
}
Each array must contain exactly ${limit} items. Use natural, user-friendly phrasing.`;
};

export const NOVA_PULSE_SUMMARY = <T>(data: T, locale: string) =>
  `Based on the provided data - ${JSON.stringify(data)}, analyze my academic performance and provide a detailed summary. Return the response in JSON format with the following structure:

{
  "title": "A concise title that reflects the overall conclusion about my academic performance (e.g., 'Excellent Performance', 'Average Level', 'Needs Improvement')",
  "color": "A color that corresponds to the title. Choose one from: green (excellent), lime (good), yellow (satisfactory), red (poor).",
  "strengths": "A list of key strengths based on the data (e.g., 'high grades in mathematics', 'consistent homework completion').",
  "weaknesses": "A list of major areas for improvement (e.g., 'low performance in literature', 'frequent absences').",
  "recommendations": "A brief list of actionable recommendations (no more than 2-3 points) to help improve academic performance.",
  "body": "A general conclusion about academic performance in 2-3 sentences, summarizing the analysis."
}

Translate the entire response into ${locale}.`;

export const USER_SUMMARY = <T extends { userData: unknown; aiUsage: unknown }>(
  data: T,
  locale: string,
) => `You are an expert analyst writing an Executive Summary for a confidential User Activity Report. Output ONLY valid JSON.

${JSON.stringify(data)}

Write a concise executive summary (120–180 words) in the requested language (${locale}). Structure:

1. **Overview** — One sentence: user name, role, plan (Premium/Base), registration date.
2. **Activity snapshot** — Key metrics: conversations, CSM issues, purchases. If AI usage exists: requests count, total cost in USD.
3. **Insights** — 1–2 sentences on notable patterns: e.g. top AI model used, engagement level (active/moderate/low), purchase activity, or any open CSM issues.
4. **Recommendation** — One actionable suggestion for the account owner (e.g. follow up on open tickets, suggest upgrade, or encourage AI usage).

Rules:
- If aiUsage.requestCount is 0 or empty, omit AI usage from the summary.
- If aiUsage.byModel exists and has items, mention the most used model.
- Be factual and neutral. Do not invent data.
- Use plain text only; no markdown or HTML.

Output strictly this JSON:

{
  "content": "Your full summary text as a single string. Use paragraphs separated by newlines for readability."
}

Return only the JSON object.
`;
