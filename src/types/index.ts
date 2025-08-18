// 消息接口
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

// 对话接口
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 应用设置接口
export interface AppSettings {
  ollamaUrl: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'system';
  streamResponse: boolean;
}

// API响应接口
export interface OllamaResponse {
  response: string;
  done: boolean;
  context?: number[];
}

// 模型信息接口
export interface ModelInfo {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

// 存储键名
export const STORAGE_KEYS = {
  CONVERSATIONS: 'ai-chat-conversations',
  SETTINGS: 'ai-chat-settings',
  CURRENT_CONVERSATION: 'ai-chat-current'
} as const;

// 存储相关类型
export interface StoredData {
  conversations: Conversation[];
  settings: AppSettings;
  currentConversationId: string | null;
}

// API请求接口
export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

// 模型列表响应接口
export interface ModelsResponse {
  models: ModelInfo[];
}