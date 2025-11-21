import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Archive, 
  CircleDot, 
  VolumeX, 
  Download,
  Trash2,
  Star
} from 'lucide-react';

interface ChatOptionsDropdownProps {
  onArchive: () => void;
  onMarkUnread: () => void;
  onMute: () => void;
  onExport: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  isMuted?: boolean;
  isFavorite?: boolean;
}

export const ChatOptionsDropdown: React.FC<ChatOptionsDropdownProps> = ({
  onArchive,
  onMarkUnread,
  onMute,
  onExport,
  onDelete,
  onToggleFavorite,
  isMuted = false,
  isFavorite = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Mais opções"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onToggleFavorite}>
          <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onMarkUnread}>
          <CircleDot className="h-4 w-4 mr-2" />
          Marcar como não lida
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onMute}>
          <VolumeX className="h-4 w-4 mr-2" />
          {isMuted ? 'Ativar notificações' : 'Silenciar notificações'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar conversa
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onArchive}>
          <Archive className="h-4 w-4 mr-2" />
          Arquivar conversa
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir conversa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};