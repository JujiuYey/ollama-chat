import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useConversations } from '@/hooks/useConversations';
import { ollamaClient } from '@/services/ollama';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();
  const { clearAllConversations } = useConversations();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 同步设置
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // 测试连接
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // 临时设置URL进行测试
      ollamaClient.setBaseUrl(localSettings.ollamaUrl);
      const isConnected = await ollamaClient.testConnection();

      if (isConnected) {
        setConnectionStatus('success');
        toast.success('连接成功！');
        // 连接成功后加载模型列表
        await loadModels();
      } else {
        setConnectionStatus('error');
        toast.error('连接失败，请检查服务器地址');
      }
    } catch (error: unknown) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : '连接失败';
      toast.error(errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 加载模型列表
  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      ollamaClient.setBaseUrl(localSettings.ollamaUrl);
      const models = await ollamaClient.getModels();
      setAvailableModels(models.models?.map(model => model.name) || []);
    } catch {
      toast.error('加载模型列表失败');
    } finally {
      setIsLoadingModels(false);
    }
  };

  // 保存设置
  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('设置已保存');
    onOpenChange(false);
  };

  // 重置设置
  const handleReset = () => {
    const defaultSettings = {
      ollamaUrl: 'http://localhost:11434',
      selectedModel: '',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: '你是一个有用的AI助手。',
      autoSave: true,
      theme: 'system' as const,
      streamResponse: true
    };
    setLocalSettings(defaultSettings);
    toast.info('设置已重置为默认值');
  };

  // 清除所有对话
  const handleClearAllConversations = async () => {
    const success = await clearAllConversations();
    if (success) {
      setShowClearConfirm(false);
      toast.success('所有对话已清除');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            配置 Ollama 服务器连接和模型参数
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ollama 服务器配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ollama 服务器</CardTitle>
              <CardDescription>
                配置本地 Ollama 服务器连接
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ollama-url">服务器地址</Label>
                <div className="flex gap-2">
                  <Input
                    id="ollama-url"
                    value={localSettings.ollamaUrl}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                    placeholder="http://localhost:11434"
                    className="flex-1"
                  />
                  <Button
                    onClick={testConnection}
                    disabled={isTestingConnection || !localSettings.ollamaUrl}
                    variant="outline"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '测试连接'
                    )}
                  </Button>
                </div>

                {/* 连接状态 */}
                {connectionStatus !== 'idle' && (
                  <div className="flex items-center gap-2 text-sm">
                    {connectionStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">连接成功</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">连接失败</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 模型配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">模型配置</CardTitle>
              <CardDescription>
                选择和配置 AI 模型参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="model-select">选择模型</Label>
                  <Button
                    onClick={loadModels}
                    disabled={isLoadingModels || !localSettings.ollamaUrl}
                    variant="ghost"
                    size="sm"
                  >
                    {isLoadingModels ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Select
                  value={localSettings.selectedModel}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, selectedModel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length === 0 ? (
                      <SelectItem value="no-models" disabled>
                        {isLoadingModels ? '加载中...' : '无可用模型'}
                      </SelectItem>
                    ) : (
                      availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                          {model.includes('deepseek-r1') && (
                            <Badge variant="secondary" className="ml-2">推荐</Badge>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">温度 ({localSettings.temperature})</Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={localSettings.temperature}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    控制回复的随机性，值越高越随机
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">最大令牌数</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="1"
                    max="8192"
                    value={localSettings.maxTokens}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2048 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    限制回复的最大长度
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">系统提示词</Label>
                <textarea
                  id="system-prompt"
                  value={localSettings.systemPrompt}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-md"
                  placeholder="输入系统提示词..."
                />
                <p className="text-xs text-muted-foreground">
                  定义 AI 助手的角色和行为
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 应用设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">应用设置</CardTitle>
              <CardDescription>
                个性化应用体验
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动保存对话</Label>
                  <p className="text-sm text-muted-foreground">
                    自动保存对话历史到本地存储
                  </p>
                </div>
                <Switch
                  checked={localSettings.autoSave}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>流式返回</Label>
                  <p className="text-sm text-muted-foreground">
                    启用流式返回，AI回复将逐字显示
                  </p>
                </div>
                <Switch
                  checked={localSettings.streamResponse}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, streamResponse: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>主题设置</Label>
                  <p className="text-sm text-muted-foreground">
                    选择应用主题外观
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>清除数据</Label>
                  <p className="text-sm text-muted-foreground">
                    删除所有对话记录，此操作不可撤销
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清除所有对话
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            重置默认
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存设置
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* 清除确认对话框 */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认清除</DialogTitle>
            <DialogDescription>
              你确定要清除所有对话记录吗？此操作不可撤销，所有聊天历史将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleClearAllConversations}>
              <Trash2 className="h-4 w-4 mr-2" />
              确认清除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}