import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConversationItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline?: boolean;
  status?: 'active' | 'waiting' | 'resolved' | 'archived';
  type?: 'client' | 'writer' | 'support' | 'admin' | 'petition';
  isPinned?: boolean;
  petitionId?: string;
  lastMessageSender?: string;
  metadata?: { title?: string; petitionDisplayId?: string };
}

interface ChatConversationListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (conversation: ConversationItem) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  className?: string;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'waiting':
      return <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">Aguardando</Badge>;
    case 'active':
      return <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">Ativo</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="text-green-600 border-green-200 text-xs">Resolvido</Badge>;
    case 'archived':
      return <Badge variant="outline" className="text-gray-600 border-gray-200 text-xs">Arquivado</Badge>;
    default:
      return null;
  }
};

const getTypeLabel = (type?: string) => {
  switch (type) {
    case 'client': return 'Cliente';
    case 'writer': return 'Redator';
    case 'support': return 'Suporte';
    case 'admin': return 'Admin';
    default: return '';
  }
};

export const ChatConversationList: React.FC<ChatConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  searchPlaceholder = 'Buscar conversas...',
  showSearch = true,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'all' | 'waiting' | 'active' | 'resolved' | 'archived'>('all');

  const filteredConversations = conversations
    .filter((conv) => {
      if (tab !== 'all' && conv.status !== tab) return false;
      const term = searchTerm.toLowerCase();
      return (
        conv.name.toLowerCase().includes(term) ||
        conv.lastMessage.toLowerCase().includes(term) ||
        (conv.petitionId && conv.petitionId.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });

  const formatTime = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffH < 24) return `${diffH}h`;
    if (diffD < 7) return `${diffD}d`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={cn('flex flex-col h-full w-full min-w-0', className)}>
      {showSearch && (
        <div className="p-4 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <Tabs value={tab} onValueChange={(val) => setTab(val as any)} className="px-4 pt-2 shrink-0">
  <TabsList className="grid grid-cols-5 w-full">
    <TabsTrigger
      value="all"
      className="text-xs font-medium px-2 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-black"
    >
      Todas
    </TabsTrigger>
    <TabsTrigger
      value="waiting"
      className="text-xs font-medium px-2 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-black"
    >
      Aguardando
    </TabsTrigger>
    <TabsTrigger
      value="active"
      className="text-xs font-medium px-2 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-black"
    >
      Ativas
    </TabsTrigger>
    <TabsTrigger
      value="resolved"
      className="text-xs font-medium px-2 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-black"
    >
      Resolvidas
    </TabsTrigger>
    <TabsTrigger
      value="archived"
      className="text-xs font-medium px-2 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-black"
    >
      Arquivadas
    </TabsTrigger>
  </TabsList>
</Tabs>



      <ScrollArea className="flex-1 min-h-0 overflow-x-hidden h-full">
        <div className="p-2 pr-3 space-y-2 w-full min-w-0">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const messageText = `${conversation.lastMessageSender ? conversation.lastMessageSender + ': ' : ''}${conversation.lastMessage}`;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    'w-full max-w-full min-w-0 overflow-hidden rounded-lg border transition text-left',
                    'hover:bg-gray-100',
                    selectedId === conversation.id ? 'bg-blue-50 border-blue-400' : 'border-transparent'
                  )}
                >
                  <div className="p-3 pr-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>
                          {conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 basis-0">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <h4 className="block w-full font-medium text-sm truncate">
                            {conversation.metadata?.title || conversation.name}
                          </h4>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p
                              className="text-xs text-gray-600 truncate whitespace-nowrap overflow-hidden max-w-[180px]"
  title={messageText}
>
  <span className="font-semibold text-black">
    {conversation.lastMessageSender ? `${conversation.lastMessageSender}: ` : ''}
  </span>
  {conversation.lastMessage}
</p>
                        </div>

                        <div className="flex justify-between items-center mt-1 gap-2">
                          <div className="flex gap-2 items-center min-w-0">
                            {(() => {
                              const metadata = (conversation as any).metadata || {};
                              const convAny = conversation as any;
                              const petitionBadgeDisplayId =
                                metadata.petitionDisplayId ??
                                metadata.petition_display_id ??
                                metadata.display_id ??
                                metadata.petitionId ??
                                metadata.petition_id ??
                                metadata.petition?.id ??
                                convAny.petitionDisplayId ??
                                convAny.petition_display_id ??
                                convAny.petitionId ??
                                convAny.petition_id;
                              return (
                                <>
                            {conversation.isOnline && (
                              <span className="h-2 w-2 bg-green-500 rounded-full" />
                            )}
                            {conversation.type && (
                              <Badge variant="secondary" className="text-[10px] uppercase">
                                {conversation.type === 'petition' && petitionBadgeDisplayId
                                  ? `Petição #${petitionBadgeDisplayId}`
                                  : conversation.type}
                              </Badge>
                            )}
                                </>
                              );
                            })()}
                          </div>

                          {conversation.status && (
                            <Badge className="text-xs px-2 py-0.5 text-blue-600 border-blue-200">
                              {getStatusBadge(conversation.status)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p>{searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
