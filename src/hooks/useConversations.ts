import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Message, Conversation } from '../types';
import { StorageManager } from '../utils/storage';
import { createMessage, createConversation, generateConversationTitle } from '../utils/helpers';
import { toast } from 'sonner';

/**
 * 对话管理Hook
 * 提供对话的增删改查功能
 */
export const useConversations = () => {
  const {
    conversations,
    currentConversationId,
    setConversations,
    setCurrentConversationId,
    setLoading,
    setError,
  } = useAppStore();

  // 获取当前对话
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  /**
   * 安全的状态更新函数
   */
  const safeUpdateConversations = useCallback(async (updatedConversations: Conversation[]) => {
    try {
      setConversations(updatedConversations);
      await StorageManager.saveConversations(updatedConversations);
      return true;
    } catch (error) {
      console.error('Failed to update conversations:', error);
      toast.error('保存对话失败');
      return false;
    }
  }, [setConversations]);

  /**
   * 加载所有对话
   */
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const savedConversations = await StorageManager.getConversations();
      setConversations(savedConversations);
      
      // 如果没有当前对话ID，设置为第一个对话
      if (!currentConversationId && savedConversations.length > 0) {
        setCurrentConversationId(savedConversations[0].id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载对话失败';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentConversationId, setConversations, setCurrentConversationId, setLoading, setError]);

  /**
   * 创建新对话
   */
  const createNewConversation = useCallback(async (title?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const newConversation = createConversation(title);
      const updatedConversations = [newConversation, ...conversations];
      
      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        setCurrentConversationId(newConversation.id);
        toast.success('新对话已创建');
        return newConversation;
      } else {
        throw new Error('保存新对话失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建对话失败';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [conversations, safeUpdateConversations, setCurrentConversationId, setLoading, setError]);

  /**
   * 选择对话
   */
  const selectConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
    } else {
      toast.error('对话不存在');
    }
  }, [conversations, setCurrentConversationId]);

  /**
   * 添加消息到对话
   */
  const addMessageToConversation = useCallback(async (
    conversationId: string,
    message: Omit<Message, 'id' | 'timestamp'>
  ): Promise<Message | null> => {
    try {
      console.log("🚀 ~ addMessage ~ 开始添加消息:", message.role, message.content.slice(0, 50));
      console.log("🚀 ~ addMessage ~ 目标对话ID:", conversationId);
      
      // 始终从存储中获取最新数据，确保数据一致性
      const currentConversations = StorageManager.getConversations();
      console.log("🚀 ~ addMessage ~ 存储中的对话数量:", currentConversations.length);
      console.log("🚀 ~ addMessage ~ 存储中的对话IDs:", currentConversations.map(c => c.id));
      
      const conversation = currentConversations.find(conv => conv.id === conversationId);
      
      if (!conversation) {
        console.error("🚀 ~ addMessage ~ 对话不存在:", conversationId);
        console.error("🚀 ~ addMessage ~ 存储中的所有对话:", currentConversations.map(c => ({id: c.id, title: c.title})));
        throw new Error('对话不存在');
      }

      console.log("🚀 ~ addMessage ~ 找到对话:", conversation.id);
      console.log("🚀 ~ addMessage ~ 对话标题:", conversation.title);
      console.log("🚀 ~ addMessage ~ 当前对话消息数量:", conversation.messages.length);
      console.log("🚀 ~ addMessage ~ 当前对话消息:", conversation.messages.map(m => `${m.role}:${m.id.slice(-6)}`));

      const newMessage = createMessage(message.content, message.role);
      console.log("🚀 ~ addMessage ~ 新消息ID:", newMessage.id);
      
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, newMessage],
        updatedAt: Date.now(),
      };

      console.log("🚀 ~ addMessage ~ 更新后消息数量:", updatedConversation.messages.length);

      const updatedConversations = currentConversations.map(conv =>
        conv.id === conversationId ? updatedConversation : conv
      );

      console.log("🚀 ~ addMessage ~ 准备保存更新后的对话数据");
      console.log("🚀 ~ addMessage ~ 更新后的对话消息数量:", updatedConversation.messages.length);
      
      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        console.log("🚀 ~ addMessage ~ 添加成功:", newMessage.id);
        
        // 验证保存后的状态
        const savedConversations = StorageManager.getConversations();
        const savedConversation = savedConversations.find(c => c.id === conversationId);
        console.log("🚀 ~ addMessage ~ 保存后验证 - 消息数量:", savedConversation?.messages.length);
        console.log("🚀 ~ addMessage ~ 保存后验证 - 消息列表:", savedConversation?.messages.map(m => `${m.role}:${m.id.slice(-6)}`));
        
        return newMessage;
      } else {
        throw new Error('保存消息失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '添加消息失败';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('🚀 ~ addMessage ~ 错误:', error);
      return null;
    }
  }, [safeUpdateConversations, setError]);

  /**
   * 删除对话
   */
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      
      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        // 如果删除的是当前对话，切换到第一个对话
        if (currentConversationId === conversationId) {
          if (updatedConversations.length > 0) {
            setCurrentConversationId(updatedConversations[0].id);
          } else {
            setCurrentConversationId(null);
          }
        }
        
        toast.success('对话已删除');
        return true;
      } else {
        throw new Error('保存删除失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除对话失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [conversations, currentConversationId, safeUpdateConversations, setCurrentConversationId, setLoading, setError]);

  /**
   * 更新对话标题
   */
  const updateConversationTitle = useCallback(async (conversationId: string, title: string): Promise<boolean> => {
    try {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) {
        throw new Error('对话不存在');
      }

      const updatedConversation = {
        ...conversation,
        title,
        updatedAt: Date.now(),
      };

      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId ? updatedConversation : conv
      );

      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        toast.success('标题已更新');
        return true;
      } else {
        throw new Error('保存标题失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新标题失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [conversations, safeUpdateConversations, setError]);

  /**
   * 更新消息
   */
  const updateMessage = useCallback(async (
    conversationId: string,
    messageId: string,
    updates: Partial<Pick<Message, 'content' | 'role'>>
  ): Promise<Message | null> => {
    try {
      console.log("🚀 ~ updateMessage ~ 开始更新消息:", messageId, "内容长度:", updates.content?.length || 0);
      
      // 始终从存储中获取最新数据，确保数据一致性（与addMessage保持一致）
      const latestConversations = StorageManager.getConversations();
      console.log("🚀 ~ updateMessage ~ 存储中的对话数量:", latestConversations.length);
      
      const conversation = latestConversations.find(conv => conv.id === conversationId);
      
      if (!conversation) {
        console.error("🚀 ~ updateMessage ~ 对话不存在:", conversationId);
        console.error("🚀 ~ updateMessage ~ 存储中的所有对话:", latestConversations.map(c => ({id: c.id, title: c.title})));
        throw new Error('对话不存在');
      }
      
      console.log("🚀 ~ updateMessage ~ 找到对话:", conversation.id);
      console.log("🚀 ~ updateMessage ~ 对话中的消息数量:", conversation.messages.length);
      console.log("🚀 ~ updateMessage ~ 对话中的消息:", conversation.messages.map(m => `${m.role}:${m.id}`));

      let messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
      
      // 如果找不到指定ID的消息，尝试查找最后一个助手消息作为回退
      if (messageIndex === -1) {
        console.log("🚀 ~ updateMessage ~ 指定消息不存在:", messageId);
        console.log("🚀 ~ updateMessage ~ 对话中的消息:", conversation.messages.map(m => `${m.role}:${m.id}`));
        
        // 查找最后一个助手消息（从后往前找）
        let lastAssistantIndex = -1;
        for (let i = conversation.messages.length - 1; i >= 0; i--) {
          if (conversation.messages[i].role === 'assistant') {
            lastAssistantIndex = i;
            break;
          }
        }
        
        if (lastAssistantIndex !== -1) {
          console.log("🚀 ~ updateMessage ~ 使用最后一个助手消息作为回退:", conversation.messages[lastAssistantIndex].id);
          messageIndex = lastAssistantIndex;
        } else {
          throw new Error('消息不存在且无法找到助手消息');
        }
      }

      const updatedMessages = [...conversation.messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        ...updates,
        timestamp: Date.now(),
      };

      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      // 使用已经获取的最新conversations数据
      const updatedConversations = latestConversations.map(conv =>
        conv.id === conversationId ? updatedConversation : conv
      );

      console.log("🚀 ~ updateMessage ~ 准备保存更新后的消息");
      console.log("🚀 ~ updateMessage ~ 更新后的消息数量:", updatedConversation.messages.length);
      
      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        console.log("🚀 ~ updateMessage ~ 更新成功:", updatedMessages[messageIndex]);
        
        // 验证保存后的状态
        const savedConversations = StorageManager.getConversations();
        const savedConversation = savedConversations.find(c => c.id === conversationId);
        console.log("🚀 ~ updateMessage ~ 保存后验证 - 消息数量:", savedConversation?.messages.length);
        console.log("🚀 ~ updateMessage ~ 保存后验证 - 消息列表:", savedConversation?.messages.map(m => `${m.role}:${m.id.slice(-6)}`));
        
        return updatedMessages[messageIndex];
      } else {
        throw new Error('保存更新失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新消息失败';
      console.error("🚀 ~ updateMessage ~ 错误:", error);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [safeUpdateConversations, setError]);

  /**
   * 导出对话
   */
  const exportConversations = useCallback((): boolean => {
    try {
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('对话已导出');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导出对话失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [conversations, setError]);

  /**
   * 导入对话
   */
  const importConversations = useCallback(async (importedConversations: Conversation[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // 合并导入的对话，避免ID冲突
      const existingIds = new Set(conversations.map(conv => conv.id));
      const validImportedConversations = importedConversations.filter(
        conv => !existingIds.has(conv.id)
      );
      
      const updatedConversations = [...conversations, ...validImportedConversations];
      
      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        toast.success(`成功导入 ${validImportedConversations.length} 个对话`);
        return true;
      } else {
        throw new Error('保存导入失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导入对话失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [conversations, safeUpdateConversations, setLoading, setError]);

  /**
   * 清空所有对话
   */
  const clearAllConversations = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await safeUpdateConversations([]);
      if (success) {
        setCurrentConversationId(null);
        toast.success('所有对话已清空');
        return true;
      } else {
        throw new Error('保存清空失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '清空对话失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [safeUpdateConversations, setCurrentConversationId, setLoading, setError]);

  /**
   * 删除消息
   */
  const deleteMessage = useCallback(async (conversationId: string, messageId: string): Promise<boolean> => {
    try {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) {
        throw new Error('对话不存在');
      }

      const updatedMessages = conversation.messages.filter(msg => msg.id !== messageId);
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId ? updatedConversation : conv
      );

      const success = await safeUpdateConversations(updatedConversations);
      if (success) {
        toast.success('消息已删除');
        return true;
      } else {
        throw new Error('保存删除失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除消息失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [conversations, safeUpdateConversations, setError]);

  /**
   * 自动生成对话标题
   */
  const generateTitle = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation || conversation.messages.length === 0) {
        return false;
      }

      const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
      if (!firstUserMessage) {
        return false;
      }

      const title = generateConversationTitle(firstUserMessage.content);
      return await updateConversationTitle(conversationId, title);
    } catch (error) {
      console.error('生成标题失败:', error);
      return false;
    }
  }, [conversations, updateConversationTitle]);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    loadConversations,
    createConversation: createNewConversation,
    selectConversation,
    addMessage: addMessageToConversation,
    updateMessage,
    deleteMessage,
    deleteConversation,
    updateConversationTitle,
    generateTitle,
    exportConversations,
    importConversations,
    clearAllConversations,
  };
};