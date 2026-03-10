import React from 'react';
import ClientIntegratedChat from './ClientIntegratedChat';
import ClientChatNotification from './ClientChatNotification';

const ChatPage: React.FC = () => {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between pb-2 pt-1 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground">Comunique-se com nossa equipe</p>
        </div>
        <ClientChatNotification />
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <ClientIntegratedChat />
      </div>
    </div>
  );
};

export default ChatPage;
