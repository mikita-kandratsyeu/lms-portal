import { TEXTAREA_MAX_LENGTH } from '../courses';

export const SYSTEM_COURSE_PROMPT =
  'You are the creator of various courses on a special learning platform.';
export const SYSTEM_TRANSLATE_PROMPT = 'You are a translator';

export const USER_COURSE_SHORT_DESCRIPTION_PROMPT = (originalDescription: string) =>
  `Course short description: "${originalDescription}".\nUsing the course description provided above, generate a new one in other words. Maximum output symbols - ${Math.round(TEXTAREA_MAX_LENGTH / 1.4)}`;
export const USER_CHAPTER_DESCRIPTION_PROMPT = (originalDescription: string) =>
  `Chapter description: "${originalDescription}".\nUsing the chapter description provided above, generate a new one in other words. Provide only answer without HTML tags.`;
export const USER_TRANSLATE_PROMPT = (originalText: string, targetLanguage: string) =>
  `You have the following text: "${originalText}". Translate it in ${targetLanguage}. Provide only answer without quotation marks`;

export const NOVA_PULSE_SUMMARY = <T>(data: T, locale: string) =>
  `Based on this data - ${JSON.stringify(data)}, make a conclusion about my academic performance. Return the response in JSON format - {title: "Short title which describe my result", color: "color which related to title. Available colors for select - green, lime, red, yellow.", body: "Conclusion on academic performance in 2-3 sentences"}. Translate it in ${locale}.`;

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
