// src/components/chat/ChatHeader.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatOptionsDropdown } from './ChatOptionsDropdown';
import { ConversationInfoModal } from './ConversationInfoModal';
import { ArrowLeft, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileHistoryPanel } from './FileHistoryPanel';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  type?: 'client' | 'writer' | 'support' | 'admin';
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onInfo?: () => void;
  onSettings?: () => void;
  className?: string;
  conversationId?: string;
  petitionId?: string;
  messageCount?: number;
  files?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    messageId: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    conversationId: string;
  }>;
  onDownloadFile?: (file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    messageId: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    conversationId: string;
  }) => void;
  actions?: React.ReactNode;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'busy': return 'bg-yellow-500';
    case 'away': return 'bg-orange-500';
    default: return 'bg-gray-400';
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'online': return 'Online';
    case 'busy': return 'Ocupado';
    case 'away': return 'Ausente';
    default: return 'Offline';
  }
};

const getTypeLabel = (type?: string) => {
  switch (type) {
    case 'client': return 'Cliente';
    case 'writer': return 'Redator';
      case 'admin': return 'Administrador';
    default: return '';
  }
};

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  status,
  type,
  subtitle,
  showBackButton = false,
  onBack,
  onSearch,
  onInfo,
  onSettings,
  className,
  conversationId,
  petitionId,
  messageCount = 0,
  files = [],
  onDownloadFile,
  actions,
}) => {
  const [showInfoModal, setShowInfoModal] = React.useState(false);

  const handleInfoClick = () => {
    setShowInfoModal(true);
    onInfo?.();
  };

  return (
    <div className="w-full border-b bg-white px-2">
      <div className={cn(
  // fica sempre em linha, sem quebrar, ocupando toda a largura
  'flex h-16 items-center justify-between gap-3 p-4 w-full flex-nowrap',
  className
)}>
        <div className="flex min-w-0 items-center gap-3">
          {showBackButton && onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="relative">
            <Avatar className="h-10 w-10">
              {avatar && (
                <AvatarImage 
                  src={avatar} 
                  alt={name}
                  className="object-cover"
                />
              )}
              <AvatarFallback>
                {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
              </AvatarFallback>
            </Avatar>
            {status && (
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full',
                getStatusColor(status)
              )} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
              {type && (
                <Badge variant="outline" className="text-xs py-0">
                  {getTypeLabel(type)}
                </Badge>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
              {status && (
                <span className="flex items-center gap-1">
                  <span className={cn('w-2 h-2 rounded-full', getStatusColor(status))} />
                  {getStatusText(status)}
                </span>
              )}
              {subtitle && (
                <>
                  {status && <span>•</span>}
                  <span className="truncate">{subtitle}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {files && onDownloadFile && files.length > 0 && (
            <FileHistoryPanel files={files} onDownload={onDownloadFile} />
          )}

          <Button variant="ghost" size="sm" onClick={handleInfoClick} aria-label="Informações">
            <Info className="h-4 w-4" />
          </Button>

          {actions}

          <ChatOptionsDropdown
            onArchive={() => {}}
            onMarkUnread={() => {}}
            onExport={() => {
              if (!conversationId) return;
              const exportData = {
                conversation: name,
                date: new Date().toISOString(),
                petitionId,
                messageCount,
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `conversa-${name}-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            onMute={() => {}}
            onDelete={() => {
              if (confirm('Tem certeza que deseja excluir esta conversa?')) {
                // Delete handled elsewhere
              }
            }}
            onToggleFavorite={() => {}}
          />
        </div>
      </div>

      <ConversationInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        conversation={{
          id: conversationId || 'unknown',
          name:
            type === 'petition'
              ? (() => {
                  const petitionDisplayId =
                    metadata?.petitionDisplayId ??
                    metadata?.petition_display_id ??
                    metadata?.display_id ??
                    metadata?.petitionId ??
                    metadata?.petition_id ??
                    metadata?.petition?.id ??
                    petitionId;
                  return petitionDisplayId ? `Petição #${petitionDisplayId}` : name;
                })()
              : name,
          type: type || 'client',
          status: status === 'online' ? 'active' : 'waiting',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastActivity: new Date(),
          messageCount,
          petitionId,
          petitionTitle:
            metadata?.petitionDisplayId ??
            metadata?.petition_display_id ??
            metadata?.display_id ??
            metadata?.petitionId ??
            metadata?.petition_id ??
            metadata?.petition?.id ||
            petitionId
        }}
      />
    </div>
  );
};

export default ChatHeader;
