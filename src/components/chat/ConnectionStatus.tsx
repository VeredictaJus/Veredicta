import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  isReconnecting = false 
}) => {
  if (isConnected && !isReconnecting) {
    return (
      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
        <Wifi className="h-3 w-3 mr-1" />
        Conectado
      </Badge>
    );
  }

  if (isReconnecting) {
    return (
      <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
        <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
        Reconectando...
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
      <WifiOff className="h-3 w-3 mr-1" />
      Desconectado
    </Badge>
  );
};