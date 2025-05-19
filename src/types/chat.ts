
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  content: string;
  sender: ChatRole;
  timestamp: Date;
}

export interface AIResponse {
  response: string;
  messages: {
    role: ChatRole;
    content: string;
  }[];
}
