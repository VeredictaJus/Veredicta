import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export type ConversationSidebarProps = {
  conversations: Array<{
    id: string;
    name: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    isOnline: boolean;
    status: string;
    type: string;
    isPinned: boolean;
    lastMessageSender: string;
    category: string;
    notifications: boolean;
    avatar: string;
  }>;
  selectedConversation?: ConversationSidebarProps['conversations'][number] | null;
  onSelect: (conversation: { id: string }) => void;
  onMarkAsRead: (conversationId: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  unreadCount: number;
};

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  selectedConversation,
  onSelect,
  onMarkAsRead,
  onSearch,
  searchQuery,
  unreadCount,
}) => {
  // ✅ Eliminar conversas duplicadas pelo ID
  const uniqueConversations = Array.from(
    new Map(conversations.map((conv) => [conv.id, conv])).values()
  );

  return (
    <div className="w-80 border-r bg-white overflow-y-auto">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {uniqueConversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
            selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => {
            onSelect(conversation);
            if (conversation.unreadCount > 0) {
              onMarkAsRead(conversation.id);
            }
          }}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar} />
            <AvatarFallback>
              {(conversation.name.toLowerCase().includes('suporte') ||
                conversation.name.toLowerCase().includes('veredicta'))
                ? 'SV'
                : conversation.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {conversation.name}
              </h3>
              {conversation.unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
