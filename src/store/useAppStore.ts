import { create } from 'zustand';
import { Conversation, AppSettings } from '@/types';

interface AppState {
  // 对话相关
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // UI 状态
  isLoading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
  
  // 设置
  settings: AppSettings;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
  updateConversation: (conversation: Conversation) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  
  setSettings: (settings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  ollamaUrl: 'http://localhost:11434',
  selectedModel: '',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: '你是一个有用的AI助手。',
  autoSave: true,
  theme: 'system',
  streamResponse: true
};

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,
  isSidebarOpen: true,
  settings: defaultSettings,
  
  // 对话操作
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  updateConversation: (updatedConversation) => {
    const { conversations } = get();
    const updatedConversations = conversations.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation : conv
    );
    set({ conversations: updatedConversations });
  },
  
  // UI 操作
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // 设置操作
  setSettings: (settings) => set({ settings })
}));