import React from 'react';
import { MessageSquare, Users, HelpCircle } from 'lucide-react';

interface ChatEmptyStateProps {
  type?: 'conversations' | 'messages' | 'search';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  type = 'conversations',
  title,
  description,
  icon,
  className = ""
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'conversations':
        return {
          icon: <Users className="h-12 w-12 text-gray-300" />,
          title: 'Nenhuma conversa disponível',
          description: 'Suas conversas aparecerão aqui quando você começar a conversar.'
        };
      case 'messages':
        return {
          icon: <MessageSquare className="h-12 w-12 text-gray-300" />,
          title: 'Selecione uma conversa',
          description: 'Escolha uma conversa da lista para começar a trocar mensagens.'
        };
      case 'search':
        return {
          icon: <HelpCircle className="h-12 w-12 text-gray-300" />,
          title: 'Nenhum resultado encontrado',
          description: 'Tente ajustar sua busca ou limpar os filtros.'
        };
      default:
        return {
          icon: <MessageSquare className="h-12 w-12 text-gray-300" />,
          title: 'Nada para mostrar',
          description: 'Não há conteúdo disponível no momento.'
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className={`flex flex-col items-center justify-center h-64 text-center text-gray-500 ${className}`}>
      {icon || defaultContent.icon}
      <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
        {title || defaultContent.title}
      </h3>
      <p className="text-sm text-gray-600 max-w-sm">
        {description || defaultContent.description}
      </p>
    </div>
  );
};