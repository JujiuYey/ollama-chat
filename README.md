# 🤖 Local AI Chat Application

**[中文](README-CN.md) | English**

A modern local AI chat application built with React + TypeScript + Vite, specifically designed for local Ollama AI services. Provides a ChatGPT-like conversation experience with real-time interaction with local AI models like DeepSeek-R1:8b.

## ✨ Core Features

- 🤖 **Local AI Model Integration** - Direct communication with local Ollama service, no cloud API required
- 💬 **Real-time Chat Interface** - Smooth chat experience with streaming and non-streaming responses
- 📱 **Responsive Design** - Perfect adaptation for desktop and mobile devices
- 🌙 **Theme Switching** - Support for dark/light themes, personalized interface
- 💾 **Local Data Storage** - Chat history saved locally, privacy protection
- 🎨 **Modern UI** - Beautiful interface design based on shadcn/ui
- ⚡ **Zero Backend Dependencies** - Pure frontend application, simple deployment
- 🔒 **Privacy Protection** - Data completely localized, no external service communication

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **UI Component Library**: shadcn/ui + Radix UI
- **Styling Solution**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite 6.3.5
- **Package Manager**: pnpm
- **AI Service**: Local Ollama + DeepSeek-R1:8b model

## 📋 Prerequisites

Before getting started, please ensure your system has the following software installed:

- **Node.js** 18+
- **pnpm** package manager
- **Ollama** local AI service

### Installing Ollama

1. Visit [Ollama Official Website](https://ollama.ai/) to download and install
2. Start Ollama service:
   ```bash
   ollama serve
   ```
3. Download DeepSeek-R1 model:
   ```bash
   ollama pull deepseek-r1:8b
   ```

## 🚀 Quick Start

### 1. Clone Project

```bash
git clone <repository-url>
cd local-ai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Access Application

Open your browser and visit `http://localhost:5173`

## 📦 Available Scripts

```bash
# Start development server
pnpm dev

# Build production version
pnpm build

# Preview build results
pnpm preview

# Code linting
pnpm lint

# Type checking
pnpm check
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── chat/           # Chat-related components
│   │   ├── ChatInterface.tsx    # Main chat interface
│   │   ├── MessageList.tsx      # Message list
│   │   ├── MessageInput.tsx     # Message input box
│   │   ├── Message.tsx          # Single message component
│   │   └── Sidebar.tsx          # Sidebar
│   ├── settings/       # Settings-related components
│   ├── ui/            # Basic UI components (shadcn/ui)
│   ├── theme-provider.tsx       # Theme provider
│   └── theme-toggle.tsx         # Theme toggle
├── hooks/              # Custom hooks
│   ├── useConversations.ts      # Conversation management
│   ├── useSettings.ts           # Settings management
│   └── useTheme.ts             # Theme management
├── services/           # Service layer
│   └── ollama.ts               # Ollama API client
├── store/              # State management
│   └── useAppStore.ts          # Global state
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── pages/              # Page components
    └── App.tsx                 # Main application component
```

## 🎯 Core Functions

### Chat Features
- ✅ Real-time AI conversation
- ✅ Message history
- ✅ Multi-line text input
- ✅ Markdown rendering support
- ✅ Code syntax highlighting
- ✅ Auto-scroll to latest message

### Conversation Management
- ✅ Create new conversation
- ✅ Delete conversation
- ✅ Browse conversation history
- ✅ Export conversation records

### Settings Configuration
- ✅ Ollama service address configuration
- ✅ AI model selection
- ✅ Connection status detection
- ✅ Theme switching
- ✅ Font size adjustment

## 🔧 Configuration

### Ollama Connection Configuration

Default configuration:
- **Service Address**: `http://localhost:11434`
- **Default Model**: `deepseek-r1:8b`

You can modify these configurations in the settings page to suit your environment.

### Supported Models

The application supports all Ollama-compatible models, including but not limited to:
- DeepSeek-R1:8b
- Llama 2/3
- Mistral
- CodeLlama
- Other Ollama-supported models

## 🚀 Deployment

### Production Build

```bash
# Build application
pnpm build

# Build artifacts are located in the dist/ directory
```

### Deployment Options

1. **Static Hosting**: Vercel, Netlify, GitHub Pages
2. **Self-hosting**: Nginx + static file service
3. **Containerization**: Docker + Nginx

### Docker Deployment Example

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

## 🔒 Privacy & Security

- **Local First**: All conversation data is stored locally in the browser
- **No Cloud Dependencies**: No data sent to any external services
- **Open Source Transparency**: Code is completely open source and auditable
- **Data Control**: Users have complete control over their data

## 🤝 Contributing

We welcome contributions of any kind!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Guidelines

- Use TypeScript for type-safe development
- Follow ESLint code standards
- Use functional programming style for components
- Use Zustand for state management
- Follow responsive design principles

## 🐛 Issue Reporting

If you encounter any issues or have feature suggestions, please:

1. Check [Issues](../../issues) for existing related issues
2. If none exist, create a new Issue
3. Describe the problem or suggestion in detail
4. Provide reproduction steps (if it's a bug)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Thanks to the following open source projects:

- [React](https://reactjs.org/) - User interface library
- [Vite](https://vitejs.dev/) - Build tool
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Ollama](https://ollama.ai/) - Local AI service
- [Zustand](https://github.com/pmndrs/zustand) - State management

---

**Enjoy your conversation experience with local AI!** 🚀
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
