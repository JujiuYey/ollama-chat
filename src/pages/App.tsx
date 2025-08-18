import React, { useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <ChatInterface onOpenSettings={() => setIsSettingsOpen(true)} />
        
        <SettingsDialog 
          open={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
        />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;