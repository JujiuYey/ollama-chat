import { Message, Conversation } from '../types';
import { toast } from 'sonner';

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化时间戳为可读格式
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes <= 1 ? '刚刚' : `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}小时前`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * 创建新消息
 */
export function createMessage(content: string, role: 'user' | 'assistant'): Message {
  return {
    id: generateId(),
    content,
    role,
    timestamp: Date.now()
  };
}

/**
 * 创建新对话
 */
export function createConversation(title?: string): Conversation {
  const now = Date.now();
  return {
    id: generateId(),
    title: title || '新对话',
    messages: [],
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 根据消息内容生成对话标题
 */
export function generateConversationTitle(content: string | Message[]): string {
  if (typeof content === 'string') {
    // 取前30个字符作为标题
    const title = content.slice(0, 30);
    return title.length < content.length ? title + '...' : title;
  }
  
  if (content.length === 0) {
    return '新对话';
  }
  
  const firstUserMessage = content.find(m => m.role === 'user');
  if (!firstUserMessage) {
    return '新对话';
  }
  
  // 取前30个字符作为标题
  const title = firstUserMessage.content.slice(0, 30);
  return title.length < firstUserMessage.content.length ? title + '...' : title;
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    toast.error('复制到剪贴板失败');
    // 降级方案
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      toast.error('复制文本失败');
      return false;
    }
  }
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, contentType: string = 'application/json'): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 验证URL格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}