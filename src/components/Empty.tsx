import React from 'react';
import { Bot, MessageCircle, Sparkles, Zap, Users, BookOpen } from 'lucide-react';

export function Empty() {
  const features = [
    {
      icon: MessageCircle,
      title: '智能对话',
      description: '与AI进行自然流畅的对话交流',
      color: 'text-blue-500'
    },
    {
      icon: Zap,
      title: '快速响应',
      description: '基于Ollama的本地化部署，响应迅速',
      color: 'text-yellow-500'
    },
    {
      icon: Users,
      title: '多种角色',
      description: '支持不同的AI助手角色和专业领域',
      color: 'text-green-500'
    },
    {
      icon: BookOpen,
      title: '知识丰富',
      description: '涵盖广泛的知识领域，提供专业建议',
      color: 'text-purple-500'
    }
  ];

  const suggestions = [
    '帮我写一封邮件',
    '解释一下量子计算',
    '推荐一些学习编程的方法',
    '翻译这段文字'
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        {/* 主标题区域 */}
        <div className="mb-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            欢迎使用 AI 助手
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            基于 Ollama 的本地化 AI 对话助手，为您提供智能、快速、安全的对话体验
          </p>
        </div>

        {/* 功能特性 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div className={`w-12 h-12 ${feature.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* 对话建议 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            试试这些对话开始
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 
                          rounded-lg p-3 text-left cursor-pointer transition-colors duration-200 
                          border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {suggestion}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>开始输入消息与 AI 助手对话，体验智能交互的魅力</p>
        </div>
      </div>
    </div>
  );
}