# 🤖 本地AI对话应用

**中文 | [English](README.md)**

一个基于React + TypeScript + Vite构建的现代化本地AI对话应用，专门为本地Ollama AI服务设计。提供类似ChatGPT的对话体验，支持与DeepSeek-R1:8b等本地AI模型进行实时对话交互。

## ✨ 核心特性

- 🤖 **本地AI模型集成** - 直接与本地Ollama服务通信，无需云端API
- 💬 **实时对话界面** - 流畅的聊天体验，支持流式和非流式响应
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **主题切换** - 支持深色/浅色主题，个性化界面
- 💾 **本地数据存储** - 对话历史本地保存，保护隐私
- 🎨 **现代化UI** - 基于shadcn/ui的精美界面设计
- ⚡ **零后端依赖** - 纯前端应用，部署简单
- 🔒 **隐私保护** - 数据完全本地化，不向外部服务发送

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **UI组件库**: shadcn/ui + Radix UI
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **构建工具**: Vite 6.3.5
- **包管理器**: pnpm
- **AI服务**: 本地Ollama + DeepSeek-R1:8b模型

## 📋 前置要求

在开始之前，请确保您的系统已安装以下软件：

- **Node.js** 18+ 
- **pnpm** 包管理器
- **Ollama** 本地AI服务

### 安装Ollama

1. 访问 [Ollama官网](https://ollama.ai/) 下载并安装
2. 启动Ollama服务：
   ```bash
   ollama serve
   ```
3. 下载DeepSeek-R1模型：
   ```bash
   ollama pull deepseek-r1:8b
   ```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd local-ai
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 📦 可用脚本

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 类型检查
pnpm check
```

## 🏗️ 项目结构

```
src/
├── components/          # React组件
│   ├── chat/           # 聊天相关组件
│   │   ├── ChatInterface.tsx    # 主聊天界面
│   │   ├── MessageList.tsx      # 消息列表
│   │   ├── MessageInput.tsx     # 消息输入框
│   │   ├── Message.tsx          # 单条消息组件
│   │   └── Sidebar.tsx          # 侧边栏
│   ├── settings/       # 设置相关组件
│   ├── ui/            # 基础UI组件 (shadcn/ui)
│   ├── theme-provider.tsx       # 主题提供者
│   └── theme-toggle.tsx         # 主题切换
├── hooks/              # 自定义钩子
│   ├── useConversations.ts      # 对话管理
│   ├── useSettings.ts           # 设置管理
│   └── useTheme.ts             # 主题管理
├── services/           # 服务层
│   └── ollama.ts               # Ollama API客户端
├── store/              # 状态管理
│   └── useAppStore.ts          # 全局状态
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
└── pages/              # 页面组件
    └── App.tsx                 # 主应用组件
```

## 🎯 核心功能

### 聊天功能
- ✅ 实时AI对话
- ✅ 消息历史记录
- ✅ 多行文本输入
- ✅ Markdown渲染支持
- ✅ 代码语法高亮
- ✅ 自动滚动到最新消息

### 对话管理
- ✅ 创建新对话
- ✅ 删除对话
- ✅ 浏览对话历史
- ✅ 导出对话记录

### 设置配置
- ✅ Ollama服务地址配置
- ✅ AI模型选择
- ✅ 连接状态检测
- ✅ 主题切换
- ✅ 字体大小调整

## 🔧 配置说明

### Ollama连接配置

默认配置：
- **服务地址**: `http://localhost:11434`
- **默认模型**: `deepseek-r1:8b`

您可以在设置页面修改这些配置以适应您的环境。

### 支持的模型

应用支持所有Ollama兼容的模型，包括但不限于：
- DeepSeek-R1:8b
- Llama 2/3
- Mistral
- CodeLlama
- 其他Ollama支持的模型

## 🚀 部署

### 生产构建

```bash
# 构建应用
pnpm build

# 构建产物位于 dist/ 目录
```

### 部署选项

1. **静态托管**: Vercel、Netlify、GitHub Pages
2. **自托管**: Nginx + 静态文件服务
3. **容器化**: Docker + Nginx

### Docker部署示例

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 隐私与安全

- **本地优先**: 所有对话数据都存储在浏览器本地
- **无云端依赖**: 不向任何外部服务发送数据
- **开源透明**: 代码完全开源，可审计
- **数据控制**: 用户完全控制自己的数据

## 🤝 贡献指南

我们欢迎任何形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 组件使用函数式编程风格
- 使用 Zustand 进行状态管理
- 遵循响应式设计原则

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请：

1. 查看 [Issues](../../issues) 是否有相关问题
2. 如果没有，请创建新的 Issue
3. 详细描述问题或建议
4. 提供复现步骤（如果是bug）

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目：

- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 构建工具
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Ollama](https://ollama.ai/) - 本地AI服务
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

---

**享受与本地AI的对话体验！** 🚀
