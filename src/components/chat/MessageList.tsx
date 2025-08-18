import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './Message';
import { Message as MessageType } from '@/types';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  streamingMessage?: {
    conversationId: string;
    messageId: string;
    content: string;
  } | null;
}

export function MessageList({ messages, isLoading = false, streamingMessage }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, streamingMessage]);

  // 创建显示用的消息列表
  const displayMessages = [...messages];

  // 如果有流式消息，替换对应的消息
  if (streamingMessage) {
    const messageIndex = displayMessages.findIndex(m => m.id === streamingMessage.messageId);
    if (messageIndex !== -1) {
      displayMessages[messageIndex] = {
        ...displayMessages[messageIndex],
        content: streamingMessage.content
      };
    }
  }

  if (displayMessages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            欢迎使用 AI 助手
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            我是您的智能助手，可以帮助您解答问题、处理任务或进行有趣的对话。请开始我们的交流吧！
          </p>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">💡 问题解答</div>
              <div className="text-gray-600 dark:text-gray-400">回答各种问题，提供专业建议</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">✍️ 内容创作</div>
              <div className="text-gray-600 dark:text-gray-400">帮助编写文档、邮件或创意内容</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">🤝 日常对话</div>
              <div className="text-gray-600 dark:text-gray-400">进行轻松愉快的交流和讨论</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const streamingMessageId = streamingMessage?.messageId;

  return (
    <ScrollArea className="flex-1 bg-gray-50/30 dark:bg-gray-900/30" ref={scrollAreaRef}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {displayMessages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLast={index === displayMessages.length - 1 && !isLoading}
            isStreaming={message.id === streamingMessageId}
          />
        ))}

        {/* 加载状态 */}
        {isLoading && !streamingMessage && (
          <div className="w-full flex justify-start mb-4">
            <div className="flex max-w-[85%] gap-3 group">
              <div className="h-8 w-8 shrink-0 mt-1 rounded-full bg-gray-600 text-white dark:bg-gray-300 dark:text-gray-800 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="relative">
                <div className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI助手正在思考...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 滚动锚点 */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}