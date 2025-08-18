import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onStopGeneration?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  isLoading = false,
  onStopGeneration,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [message]);

  // 自动聚焦
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // 发送后重新聚焦
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    if (onStopGeneration) {
      onStopGeneration();
    }
  };

  const canSend = message.trim() && !isLoading && !disabled;

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit}>
          <div
            className={`
              relative flex items-center rounded-2xl border transition-all duration-200 px-4 py-3
              ${isFocused
                ? 'border-blue-500 ring-1 ring-blue-500/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
              ${disabled ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}
            `}
          >
            {/* 文本输入区域 */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={disabled ? "请先配置 Ollama 服务..." : "输入消息..."}
                disabled={disabled}
                className="
                  min-h-[24px] max-h-[200px] resize-none border-0 focus:ring-0 focus:outline-none
                  bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500
                  scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                  leading-6 w-full p-0
                "
                rows={1}
                style={{
                  boxShadow: 'none',
                  fontSize: '16px', // 防止移动端缩放
                }}
              />
            </div>

            {/* 右侧操作区域 */}
            <div className="flex items-center gap-2 ml-3">
              {/* 字符计数 */}
              {message.length > 0 && (
                <span className={`text-xs ${message.length > 1800 ? 'text-red-500' : 'text-gray-400'}`}>
                  {message.length}
                </span>
              )}

              {/* 发送/停止按钮 */}
              {isLoading ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleStop}
                  className="h-8 w-8 p-0 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  title="停止生成"
                >
                  <Square className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSend}
                  className={`
                    h-8 w-8 p-0 rounded-full transition-all duration-200
                    ${canSend
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }
                  `}
                  title="发送消息"
                >
                  <Send className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* 底部提示信息 */}
          {(disabled || isFocused) && (
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {disabled
                  ? "请在设置中配置 Ollama 服务地址"
                  : "按 Enter 发送，Shift+Enter 换行"
                }
              </span>
              {!disabled && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  最多 2000 字符
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}