import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useChat } from '@/contexts/ChatContext';
import Chat from './Chat';

interface ChatButtonProps {
  selectedPetitionId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function ChatButton({ 
  selectedPetitionId, 
  variant = 'default', 
  size = 'default',
  className = ''
}: ChatButtonProps) {
  const { user } = useNewAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // 🚀 SINCRONIZAÇÃO: Usar o mesmo ChatContext do chat principal
  const { getUnreadCount } = useChat();
  
  // Calcular unread count a partir do ChatContext
  const unreadCount = getUnreadCount();

  const handleChatOpen = () => {
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    // O unread count é atualizado automaticamente pelo ChatContext
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleChatOpen}
        className={`relative ${className}`}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <span>Chat</span>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Chat
        isOpen={isChatOpen}
        onClose={handleChatClose}
        selectedPetitionId={selectedPetitionId}
      />
    </>
  );
}