import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StorageManager } from '@/utils/storage';
import { AppSettings } from '@/types';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: AppSettings = {
  ollamaUrl: 'http://localhost:11434',
  selectedModel: 'deepseek-r1:8b',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: '你是一个有用的AI助手。',
  autoSave: true,
  theme: 'system',
  streamResponse: false
};

export function useSettings() {
  const { settings, setSettings } = useAppStore();

  // 加载设置
  const loadSettings = useCallback(async () => {
    try {
      const storedSettings = await StorageManager.getSettings();
      const mergedSettings = { ...DEFAULT_SETTINGS, ...storedSettings };
      setSettings(mergedSettings);
      return mergedSettings;
    } catch {
        toast.error('加载设置失败，使用默认设置');
      // 使用默认设置
      setSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  }, [setSettings]);

  // 保存设置
  const saveSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await StorageManager.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      toast.error('保存设置失败');
      throw error;
    }
  }, [settings, setSettings]);

  // 更新单个设置项
  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      await StorageManager.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      toast.error('更新设置失败');
      throw error;
    }
  }, [settings, setSettings]);

  // 重置设置为默认值
  const resetSettings = useCallback(async () => {
    try {
      await StorageManager.saveSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      toast.success('设置已重置为默认值');
      return DEFAULT_SETTINGS;
    } catch (error) {
      toast.error('重置设置失败');
      throw error;
    }
  }, [setSettings]);

  // 验证设置
  const validateSettings = useCallback((settingsToValidate: Partial<AppSettings>) => {
    const errors: string[] = [];

    // 验证 Ollama URL
    if (settingsToValidate.ollamaUrl) {
      try {
        new URL(settingsToValidate.ollamaUrl);
      } catch {
        errors.push('Ollama 服务器地址格式不正确');
      }
    }

    // 验证温度值
    if (settingsToValidate.temperature !== undefined) {
      if (settingsToValidate.temperature < 0 || settingsToValidate.temperature > 2) {
        errors.push('温度值必须在 0-2 之间');
      }
    }

    // 验证最大令牌数
    if (settingsToValidate.maxTokens !== undefined) {
      if (settingsToValidate.maxTokens < 1 || settingsToValidate.maxTokens > 8192) {
        errors.push('最大令牌数必须在 1-8192 之间');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // 获取设置摘要
  const getSettingsSummary = useCallback(() => {
    return {
      isConfigured: !!(settings.ollamaUrl && settings.selectedModel),
      ollamaUrl: settings.ollamaUrl,
      selectedModel: settings.selectedModel,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      autoSave: settings.autoSave,
      theme: settings.theme
    };
  }, [settings]);

  return {
    settings,
    defaultSettings: DEFAULT_SETTINGS,
    loadSettings,
    saveSettings,
    updateSettings: saveSettings,
    updateSetting,
    resetSettings,
    validateSettings,
    getSettingsSummary
  };
}