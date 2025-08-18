import { Conversation, AppSettings, STORAGE_KEYS, StoredData } from '../types';
import { toast } from 'sonner';

/**
 * 本地存储工具类
 */
export class StorageManager {
  /**
   * 获取所有对话
   */
  static getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      toast.error('读取对话数据失败');
      return [];
    }
  }

  /**
   * 保存对话列表
   */
  static saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch {
      toast.error('保存对话数据失败');
    }
  }

  static saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    this.saveConversations(conversations);
  }

  /**
   * 添加新对话
   */
  static addConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    conversations.unshift(conversation); // 新对话添加到开头
    this.saveConversations(conversations);
  }

  /**
   * 更新对话
   */
  static updateConversation(updatedConversation: Conversation): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === updatedConversation.id);
    if (index !== -1) {
      conversations[index] = updatedConversation;
      this.saveConversations(conversations);
    }
  }

  /**
   * 删除对话
   */
  static deleteConversation(conversationId: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    this.saveConversations(filtered);
  }

  /**
   * 获取当前对话ID
   */
  static getCurrentConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    } catch {
      toast.error('读取当前对话ID失败');
      return null;
    }
  }

  /**
   * 设置当前对话ID
   */
  static setCurrentConversationId(conversationId: string | null): void {
    try {
      if (conversationId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, conversationId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
      }
    } catch {
      toast.error('设置当前对话ID失败');
    }
  }

  /**
   * 获取应用设置
   */
  static getSettings(): AppSettings {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings: AppSettings = {
      ollamaUrl: 'http://localhost:11434',
      selectedModel: '',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: '你是一个有用的AI助手。',
      autoSave: true,
      theme: 'system',
      streamResponse: false
    };
    
    if (!stored) {
      return defaultSettings;
    }
    
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  }

  /**
   * 保存应用设置
   */
  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      toast.error('保存设置失败');
    }
  }

  /**
   * 清空所有数据
   */
  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch {
      toast.error('清空数据失败');
    }
  }

  static clearData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static exportData(): StoredData {
    return {
      conversations: this.getConversations(),
      settings: this.getSettings(),
      currentConversationId: this.getCurrentConversationId()
    };
  }

  static importData(data: StoredData): void {
    if (data.conversations) {
      this.saveConversations(data.conversations);
    }
    if (data.settings) {
      this.saveSettings(data.settings);
    }
    if (data.currentConversationId) {
      this.setCurrentConversationId(data.currentConversationId);
    }
  }

  /**
   * 导出对话数据
   */
  static exportConversations(): string {
    const conversations = this.getConversations();
    return JSON.stringify(conversations, null, 2);
  }

  /**
   * 导入对话数据
   */
  static importConversations(jsonData: string): boolean {
    try {
      const conversations = JSON.parse(jsonData) as Conversation[];
      // 验证数据格式
      if (Array.isArray(conversations)) {
        this.saveConversations(conversations);
        return true;
      }
      return false;
    } catch {
      toast.error('导入对话数据失败，请检查文件格式');
      return false;
    }
  }
}