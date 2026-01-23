import { TEXTAREA_MAX_LENGTH } from '../courses';

export const SYSTEM_COURSE_PROMPT =
  'You are an expert course creator and educator on a specialized learning platform.';

export const SYSTEM_TRANSLATE_PROMPT =
  'You are a professional translator with deep knowledge of languages and cultures.';

export const SYSTEM_CONVERSATION_STARTERS_PROMPT =
  'You are an expert UX writer for AI assistants. Generate short, friendly conversation starters.';

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

  return `Generate ${limit} short conversation starters for an AI assistant.
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

export const USER_SUMMARY = <T>(
  data: T,
  locale: string,
) => `Based on the provided user data, generate a formal and well-structured summary for a "User Activity Report". Include the following aspects:
1. **General User Information:** Mention the user's name, role, registration date, and the date of the last profile update.
2. **User Activity Highlights:** Summarize the number of completed actions, such as conversations, support tickets, and purchases.
3. **Key Achievements or Issues:** Highlight the most significant aspects of the user's interactions with the system (e.g., successful purchases, complex tickets, or frequent requests).
4. **Engagement Metrics:** Describe the user's level of activity (e.g., daily, weekly, infrequent).
5. **Recommendations:** Based on the data, provide brief suggestions for ways to improve the user's experience and engagement. 

Provided data:
${JSON.stringify(data)}

Formatting requirements:
- Use a professional and formal tone.
- Structure the summary in paragraphs or bullet points with clear headings.
- Ensure the content is concise but informative.
- Length: 150–200 words maximum.

Example Output:
- **General Information:** [User’s name] registered on [date] and holds the role of [role]. The profile was last updated on [date].
- **Activity Highlights:** The user has completed [X] conversations, [Y] support tickets, and [Z] purchases.
- **Key Achievements or Issues:** [Highlight any notable successes or challenges, such as resolving complex tickets or completing major purchases].
- **Engagement Level:** The user interacts with the system frequently, with activity recorded [daily/weekly/infrequently].
- **Recommendations:** [Provide actionable insights, such as offering additional resources, improving support ticket resolution processes, or encouraging further engagement].
- The output must strictly adhere to the specified JSON format and be translated into the requested language (${locale})
- The summary must be strictly formatted as JSON:
  
   {
       "content": "Text format"
   }

The response should be comprehensive, professional, and ready to be included in a formal report.
`;
