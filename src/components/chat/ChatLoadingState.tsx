import React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';

interface ChatLoadingStateProps {
  message?: string;
  className?: string;
}

export const ChatLoadingState: React.FC<ChatLoadingStateProps> = ({
  message = "Carregando conversas...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center h-64 text-gray-500 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="h-8 w-8 text-gray-300" />
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-gray-400 mt-1">Aguarde um momento...</p>
    </div>
  );
};