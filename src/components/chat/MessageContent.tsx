import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/utils/helpers';
import { toast } from 'sonner';

// 导入highlight.js样式 - 使用github主题，亮暗模式自适应
import 'highlight.js/styles/github.css';

interface MessageContentProps {
  content: string;
  isUser?: boolean;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  children: string;
  className?: string;
  node?: any;
  [key: string]: any;
}

interface CodeComponentProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const CodeBlock = ({ children, className, ...props }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';

  const handleCopy = async () => {
    const success = await copyToClipboard(children);
    if (success) {
      setCopied(true);
      toast.success('代码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('复制失败');
    }
  };

  return (
    <div className="relative group my-4">
      {/* 代码块头部 */}
      <div className="flex items-center justify-between bg-muted border border-border px-4 py-2 text-sm rounded-t-lg border-b-0">
        <span className="font-mono text-xs text-muted-foreground">
          {language || 'text'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          title="复制代码"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* 代码内容 */}
      <pre className="bg-card border border-border border-t-0 text-card-foreground p-4 rounded-b-lg overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const InlineCode = ({ children, ...props }: any) => (
  <code
    className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono"
    {...props}
  >
    {children}
  </code>
);

export function MessageContent({ content, isUser = false, isStreaming = false }: MessageContentProps) {
  // 如果是用户消息，直接显示文本
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed text-white">
        {content}
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse opacity-75">|</span>
        )}
      </div>
    );
  }

  // 处理think标签内容
  const processThinkTags = (text: string) => {
    // 使用正则表达式匹配think标签及其内容
    const thinkTagRegex = /<think>([\s\S]*?)<\/think>/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = thinkTagRegex.exec(text)) !== null) {
      // 添加think标签之前的内容
      if (match.index > lastIndex) {
        parts.push({
          type: 'content',
          text: text.slice(lastIndex, match.index)
        });
      }

      // 添加think标签内容
      parts.push({
        type: 'think',
        text: match[1].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余内容
    if (lastIndex < text.length) {
      parts.push({
        type: 'content',
        text: text.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'content', text }];
  };

  const contentParts = processThinkTags(content);

  // 创建可复用的markdown渲染组件配置
  const markdownComponents = {
    // 代码块渲染
    code: ({ node, inline, className, children, ...props }: CodeComponentProps) => {
      if (inline) {
        return <InlineCode {...props}>{children}</InlineCode>;
      }
      return (
        <CodeBlock className={className} {...props}>
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      );
    },

    // 表格样式
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),

    th: ({ children, ...props }: any) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
        {children}
      </th>
    ),

    td: ({ children, ...props }: any) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),

    // 引用块样式
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 italic" {...props}>
        {children}
      </blockquote>
    ),

    // 链接样式
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    ),

    // 列表样式
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-1 my-2" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
        {children}
      </ol>
    ),

    li: ({ children, ...props }: any) => (
      <li className="ml-4" {...props}>
        {children}
      </li>
    ),

    // 标题样式
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props}>
        {children}
      </h1>
    ),

    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-foreground" {...props}>
        {children}
      </h2>
    ),

    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props}>
        {children}
      </h3>
    ),

    // 段落样式
    p: ({ children, ...props }: any) => (
      <p className="mb-3 leading-relaxed text-foreground" {...props}>
        {children}
      </p>
    ),

    // 分割线
    hr: ({ ...props }: any) => (
      <hr className="my-6 border-border" {...props} />
    ),
  };

  // AI消息使用markdown渲染
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-gray">
      {contentParts.map((part, index) => {
        if (part.type === 'think') {
          return (
            <details key={index} className="my-4 border border-border rounded-lg">
              <summary className="cursor-pointer px-4 py-2 bg-muted/30 hover:bg-muted/50 transition-colors rounded-t-lg text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="text-xs">🤔</span>
                AI 思考过程
              </summary>
              <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/10 rounded-b-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            </details>
          );
        } else {
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {part.text}
            </ReactMarkdown>
          );
        }
      })}

      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse opacity-75">|</span>
      )}
    </div>
  );
}
