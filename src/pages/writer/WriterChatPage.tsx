import React from 'react';
import IntegratedChat from '../../components/chat/IntegratedChat';
import WriterChatNotification from './WriterChatNotification';

export default function WriterChatPage() {
  return (
    <div className="h-[82vh] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between pb-4 pt-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground">Comunique-se com clientes e equipe</p>
        </div>
        <WriterChatNotification />
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <IntegratedChat />
      </div>
    </div>
  );
}