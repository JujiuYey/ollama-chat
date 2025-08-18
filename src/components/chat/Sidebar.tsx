import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { useConversations } from '@/hooks/useConversations';
import { formatTimestamp, truncateText } from '@/utils/helpers';
import { ThemeToggle } from '@/components/theme-toggle';

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    conversations,
    currentConversationId,
    isSidebarOpen,
    toggleSidebar
  } = useAppStore();
  
  const {
    createConversation,
    selectConversation,
    deleteConversation
  } = useConversations();

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个对话吗？')) {
      deleteConversation(conversationId);
    }
  };

  if (!isSidebarOpen) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* 移动端遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
        onClick={toggleSidebar}
      />
      
      {/* 侧边栏 */}
      <Card className="fixed left-0 top-0 h-full w-80 z-50 md:relative md:w-80 flex flex-col border-r">
        {/* 头部 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI 对话</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 新建对话按钮 */}
          <Button 
             onClick={() => createConversation()}
             className="w-full"
             size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建对话
          </Button>
        </div>

        {/* 对话列表 */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无对话</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    currentConversationId === conversation.id 
                      ? 'bg-muted border-primary' 
                      : ''
                  }`}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {truncateText(conversation.title, 30)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {conversation.messages.length} 条消息
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.updatedAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 删除按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      title="删除对话"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* 底部设置 */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={onOpenSettings}
            className="w-full"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </Card>
    </>
  );
}