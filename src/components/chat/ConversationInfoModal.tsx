import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, User } from 'lucide-react';

interface ConversationInfo {
  id: string;
  name: string;
  type: 'client' | 'writer' | 'support' | 'admin';
  status: 'active' | 'waiting' | 'resolved' | 'archived';
  startDate: Date;
  lastActivity: Date;
  messageCount: number;
  petitionId?: string;
  petitionTitle?: string;
}

interface ConversationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ConversationInfo;
}

const getStatusBadge = (status: string) => {
  const variants = {
    active: 'bg-green-100 text-green-800',
    waiting: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800'
  };
  
  const labels = {
    active: 'Ativo',
    waiting: 'Aguardando',
    resolved: 'Resolvido',
    archived: 'Arquivado'
  };
  
  return (
    <Badge className={variants[status as keyof typeof variants]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

const getTypeBadge = (type: string) => {
  const variants = {
    client: 'bg-orange-100 text-orange-800',
    writer: 'bg-blue-100 text-blue-800',
    support: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800'
  };
  
  const labels = {
    client: 'Cliente',
    writer: 'Redator',
       admin: 'Admin'
  };
  
  return (
    <Badge className={variants[type as keyof typeof variants]}>
      {labels[type as keyof typeof labels]}
    </Badge>
  );
};

export const ConversationInfoModal: React.FC<ConversationInfoModalProps> = ({
  isOpen,
  onClose,
  conversation
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informações da Conversa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {(() => {
                  try {
                    const name = typeof conversation?.name === 'string' ? conversation.name : 'U';
                    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
                  } catch (error) {
                    return 'U';
                  }
                })()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{conversation.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getTypeBadge(conversation.type)}
                {getStatusBadge(conversation.status)}
              </div>
            </div>
          </div>
          
          {/* Conversation Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Iniciado em:</span>
              <span className="font-medium">
                {conversation.startDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Última atividade:</span>
              <span className="font-medium">
                {conversation.lastActivity.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Total de mensagens:</span>
              <span className="font-medium">{conversation.messageCount}</span>
            </div>
            
            {conversation.petitionId && (
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Petição associada:</span>
                <span className="font-medium text-blue-600">
                  {conversation.petitionTitle || `#${conversation.petitionId}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};