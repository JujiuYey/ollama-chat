import React from 'react';
import { Copy, User, Bot, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Message as MessageType } from '@/types';
import { copyToClipboard, formatTimestamp } from '@/utils/helpers';
import { toast } from 'sonner';
import { MessageContent } from './MessageContent';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
  isStreaming?: boolean;
}

export function Message({ message, isLast = false, isStreaming = false }: MessageProps) {
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      toast.success('消息已复制到剪贴板');
    } else {
      toast.error('复制失败');
    }
  };

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
        {/* 头像 */}
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white dark:bg-gray-300 dark:text-gray-800'}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        {/* 消息气泡 */}
        <div className={`relative ${isUser ? 'order-first' : ''}`}>
          {/* 消息内容 */}
          <div
            className={`
              relative px-4 py-3 rounded-2xl max-w-none shadow-sm
              ${isUser
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700'
              }
              ${isStreaming ? 'animate-pulse' : ''}
            `}
          >
            <MessageContent
              content={message.content}
              isUser={isUser}
              isStreaming={isStreaming}
            />
          </div>

          {/* 时间戳和操作按钮 */}
          <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>

            {/* 复制按钮 */}
            {message.content && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={handleCopy}
                title="复制消息"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}