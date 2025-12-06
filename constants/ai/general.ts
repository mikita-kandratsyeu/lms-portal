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
export const LIMIT_CHAT_INPUT = 8000;
export const LIMIT_CONVERSATION_TITLE = 100;
export const LIMIT_CONVERSATION_STARTERS = 5;
export const LIMIT_CONNECTED_AI_AGENTS = 5;

export const enum REQUEST_STATUS {
  ALLOW = 'allow',
  FORBIDDEN = 'forbidden',
}

export const DEFAULT_TEMPERATURE = 0.7;

export const enum AGENT_ACTION {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}
