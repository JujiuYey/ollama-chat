import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useConversations } from '@/hooks/useConversations';
import { useSettings } from '@/hooks/useSettings';
import { ollamaClient } from '@/services/ollama';
import { createMessage } from '@/utils/helpers';
import { StorageManager } from '@/utils/storage';
import { Message } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  onOpenSettings: () => void;
}

export function ChatInterface({ onOpenSettings }: ChatInterfaceProps) {
  const {
    conversations,
    currentConversationId,
    isLoading,
    error,
    setLoading,
    setError,
    setConversations,
  } = useAppStore();

  const {
    loadConversations,
    addMessage,
    updateMessage,
    deleteMessage,
    generateTitle,
    createConversation
  } = useConversations();
  const { settings, loadSettings } = useSettings();

  // 获取当前对话
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  // const [showSettings, setShowSettings] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 添加临时消息状态管理，解决流式响应的异步更新问题
  const [streamingMessage, setStreamingMessage] = useState<{
    conversationId: string;
    messageId: string;
    content: string;
  } | null>(null);

  // 使用 ref 跟踪流式响应的实时内容，避免状态异步更新的问题
  const streamingContentRef = useRef<string>('');

  // 初始化数据
  useEffect(() => {
    loadSettings();
    loadConversations();
  }, []);

  // 更新ollama客户端配置
  useEffect(() => {
    if (settings.ollamaUrl) {
      ollamaClient.setBaseUrl(settings.ollamaUrl);
    }
  }, [settings.ollamaUrl]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    let conversationId = currentConversationId;
    let userMessageId: string | null = null;
    let assistantMessageId: string | null = null;

    const abortController = new AbortController();
    setAbortController(abortController);

    try {
      setLoading(true);
      setError(null);

      // 1. 确保有对话存在
      if (!conversationId) {
        const newConversation = await createConversation();
        conversationId = newConversation.id;
      }

      // 2. 先添加用户消息
      const userMessage = await addUserMessage(conversationId, content);
      userMessageId = userMessage.id;

      // 3. 处理AI响应（此时会显示思考状态）
      await handleAIResponse(
        content,
        conversationId,
        abortController.signal
      );

      // 4. 生成标题（如果需要）
      await handleTitleGeneration(conversationId);
    } catch (error: any) {
      console.error('发送消息错误:', error);
      if (error.name !== 'AbortError') {
        setError(error.message || '发送消息失败');
      }
    } finally {
      setLoading(false);
      setAbortController(null);
      setStreamingMessage(null);
      streamingContentRef.current = '';
    }
  };

  // 添加用户消息
  const addUserMessage = async (conversationId: string, userContent: string) => {
    const conversations = StorageManager.getConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) {
      throw new Error('对话不存在');
    }

    // 创建用户消息
    const userMessage = createMessage(userContent, 'user');

    // 更新对话
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: Date.now(),
    };

    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? updatedConversation : conv
    );

    // 保存到存储并更新React状态
    StorageManager.saveConversations(updatedConversations);
    setConversations(updatedConversations);

    return userMessage;
  };

  // 添加助手消息
  const addAssistantMessage = async (conversationId: string, content: string = '') => {
    const conversations = StorageManager.getConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) {
      throw new Error('对话不存在');
    }

    // 创建助手消息
    const assistantMessage = createMessage(content, 'assistant');

    // 更新对话
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, assistantMessage],
      updatedAt: Date.now(),
    };

    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? updatedConversation : conv
    );

    // 保存到存储并更新React状态
    StorageManager.saveConversations(updatedConversations);
    setConversations(updatedConversations);

    return assistantMessage;
  };

  // 处理AI响应（统一流式和非流式）
  const handleAIResponse = async (
    userContent: string,
    conversationId: string,
    signal: AbortSignal
  ) => {
    try {
      const requestOptions = {
        temperature: settings.temperature,
        num_predict: settings.maxTokens
      };

      if (settings.streamResponse) {
        // 流式响应
        // 先创建空的助手消息
        const assistantMessage = await addAssistantMessage(conversationId, '');

        streamingContentRef.current = '';
        setStreamingMessage({
          conversationId,
          messageId: assistantMessage.id,
          content: ''
        });

        await ollamaClient.generateStreamResponse(
          userContent,
          settings.selectedModel,
          (chunk) => {
            if (signal.aborted) return;

            streamingContentRef.current += chunk;
            setStreamingMessage(prev => prev ? {
              ...prev,
              content: streamingContentRef.current
            } : null);
          },
          settings.systemPrompt, // 传递系统提示词
          requestOptions // 传递其他选项
        );

        const finalContent = streamingContentRef.current;
        if (!signal.aborted && finalContent.trim()) {
          await updateAssistantMessage(conversationId, assistantMessage.id, finalContent);
        }
      } else {
        // 非流式响应
        // 先创建空的助手消息
        const assistantMessage = await addAssistantMessage(conversationId, '');

        const response = await ollamaClient.generateResponse({
          model: settings.selectedModel,
          prompt: userContent,
          system: settings.systemPrompt, // 添加系统提示词
          options: requestOptions // 添加其他选项
        });

        if (!signal.aborted && response.response?.trim()) {
          await updateAssistantMessage(conversationId, assistantMessage.id, response.response);
        }
      }
    } catch (error) {
      if (!signal.aborted) {
        // 如果出错，更新最后一条助手消息为错误信息
        const conversations = StorageManager.getConversations();
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation && conversation.messages.length > 0) {
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          if (lastMessage.role === 'assistant') {
            await updateAssistantMessage(conversationId, lastMessage.id, '响应过程中出现错误，请重试。');
          }
        }
        throw error;
      }
    }
  };

  // 更新助手消息内容
  const updateAssistantMessage = async (conversationId: string, messageId: string, content: string) => {
    const conversations = StorageManager.getConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) {
      throw new Error('对话不存在');
    }

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      throw new Error('消息不存在');
    }

    // 更新消息
    const updatedMessages = [...conversation.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content,
      timestamp: Date.now(),
    };

    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? updatedConversation : conv
    );

    // 保存到存储并更新React状态
    StorageManager.saveConversations(updatedConversations);
    setConversations(updatedConversations);
  };


  /**
   * 生成对话标题
   * @param conversationId 对话ID
   */
  const handleTitleGeneration = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    // 生成对话标题，仅当对话有2条消息（用户和助手）且标题为“新对话”时才生成
    if (conversation && conversation.messages.length === 2 && conversation.title === '新对话') {
      try {
        await generateTitle(conversationId);
      } catch (error) {
        console.warn('Failed to generate conversation title:', error);
        // Title generation failure shouldn't affect the main flow
      }
    }
  };



  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
  };

  // Check Ollama configuration
  const isOllamaConfigured = settings.ollamaUrl && settings.selectedModel;


  if (!isOllamaConfigured) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar onOpenSettings={onOpenSettings} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">配置 Ollama</h2>
            <p className="text-muted-foreground mb-4">
              请先在设置中配置 Ollama 服务器地址和模型
            </p>
            <Button onClick={onOpenSettings}>
              打开设置
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <Sidebar onOpenSettings={onOpenSettings} />

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 错误提示 */}
        {error && (
          <div className="bg-destructive/10 border-destructive/20 border-b px-4 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* 消息列表 */}
        <MessageList
          messages={currentConversation?.messages || []}
          isLoading={isLoading && !streamingMessage}
          streamingMessage={streamingMessage}
        />

        {/* 输入区域 */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
          disabled={!isOllamaConfigured}
        />
      </div>
    </div>
  );
}