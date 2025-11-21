import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNewAuth } from './NewAuthContext';

// Tipos simplificados
interface SimpleConversation {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_content?: string;
  last_message_at?: string;
  unread_count?: number;
}

interface SimpleMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  status: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

interface SimpleChatContextType {
  conversations: SimpleConversation[];
  messages: SimpleMessage[];
  currentConversation: SimpleConversation | null;
  isLoading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

const SimpleChatContext = createContext<SimpleChatContextType | null>(null);

export const useSimpleChat = () => {
  const context = useContext(SimpleChatContext);
  if (!context) {
    throw new Error('useSimpleChat deve ser usado dentro de SimpleChatProvider');
  }
  return context;
};

interface SimpleChatProviderProps {
  children: ReactNode;
}

export const SimpleChatProvider: React.FC<SimpleChatProviderProps> = ({ children }) => {
  // CORREÇÃO CRÍTICA: Verificar se o contexto está disponível antes de usar
  let user = null;
  let loading = true;
  
  try {
    const authContext = useNewAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.warn('SimpleChatProvider: NewAuthContext não disponível ainda');
  }
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<SimpleConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar conversas
  const loadConversations = async () => {
    if (!user || loading) {
      console.log('🔍 SimpleChat: Usuário não disponível ou ainda carregando');
      return;
    }

    console.log('🔍 SimpleChat: Carregando conversas para:', user.uid);
    setIsLoading(true);
    setError(null);

    try {
      // Simular carregamento com dados mock
      const mockConversations: SimpleConversation[] = [
        {
          id: 'conv-1',
          title: 'Suporte Veredicta',
          type: 'support',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_content: 'Olá! Como posso ajudá-lo?',
          last_message_at: new Date().toISOString(),
          unread_count: 0
        }
      ];

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConversations(mockConversations);
      console.log('✅ SimpleChat: Conversas carregadas:', mockConversations.length);
    } catch (err) {
      console.error('❌ SimpleChat: Erro ao carregar conversas:', err);
      setError('Erro ao carregar conversas');
    } finally {
      setIsLoading(false);
    }
  };

  // Selecionar conversa
  const selectConversation = async (id: string) => {
    console.log('🔍 SimpleChat: Selecionando conversa:', id);
    
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) {
      console.error('❌ SimpleChat: Conversa não encontrada:', id);
      return;
    }

    setCurrentConversation(conversation);

    // Carregar mensagens mock
    const mockMessages: SimpleMessage[] = [
      {
        id: 'msg-1',
        content: 'Olá! Como posso ajudá-lo?',
        sender_id: 'support-admin',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-2',
        content: 'Preciso de ajuda com minha petição',
        sender_id: user.uid,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-3',
        content: 'Claro! Vou ajudá-lo com sua petição. Pode me dar mais detalhes?',
        sender_id: 'support-admin',
        created_at: new Date().toISOString(),
        status: 'read'
      }
    ];

    setMessages(mockMessages);
    console.log('✅ SimpleChat: Mensagens carregadas:', mockMessages.length);
  };

  // Enviar mensagem
  const sendMessage = async (content: string) => {
    if (!currentConversation || !user) return;

    console.log('🔍 SimpleChat: Enviando mensagem:', content);
    
    const newMessage: SimpleMessage = {
      id: `msg-${Date.now()}`,
      content,
      sender_id: user.uid,
      created_at: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    console.log('✅ SimpleChat: Mensagem enviada');
  };

  // Carregar conversas quando usuário estiver pronto
  useEffect(() => {
    if (user && !loading) {
      console.log('🔍 SimpleChat: Usuário pronto, carregando conversas');
      loadConversations();
    }
  }, [user, loading]);

  const value: SimpleChatContextType = {
    conversations,
    messages,
    currentConversation,
    isLoading,
    error,
    loadConversations,
    selectConversation,
    sendMessage
  };

  return (
    <SimpleChatContext.Provider value={value}>
      {children}
    </SimpleChatContext.Provider>
  );
};









