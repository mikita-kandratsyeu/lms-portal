export const ChatCompletionRole = {
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  USER: 'user',
};

export const enum AI_PROVIDER {
  deepseek = 'deepseek',
  ollama = 'ollama',
  openai = 'openai',
}

export const LIMIT_REQUESTS_PER_WEEK = 5;
export const enum REQUEST_STATUS {
  ALLOW = 'allow',
  FORBIDDEN = 'forbidden',
}
