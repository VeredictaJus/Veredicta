import React from 'react';
import { SimpleChatProvider } from '@/contexts/SimpleChatContext';
import SimpleChat from '@/components/chat/SimpleChat';

const TestChatPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col p-2">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Teste</h1>
          <p className="text-gray-600">Versão simplificada para debug</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <SimpleChatProvider>
          <SimpleChat />
        </SimpleChatProvider>
      </div>
    </div>
  );
};

export default TestChatPage;
























