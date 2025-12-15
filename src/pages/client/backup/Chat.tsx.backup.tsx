import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Search,
  Menu,
  X,
} from 'lucide-react';
import { ChatConversationList } from '@/components/chat/ChatConversationList';
import { ChatMessage } from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { AdvancedSearchModal } from '@/components/chat/AdvancedSearchModal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { contentModerator, ModerationResult } from '@/services/ContentModerator';
import { notificationManager } from '@/services/NotificationManager';
import { FileHistoryPanel } from '@/components/chat/FileHistoryPanel';

interface ExtendedConversationItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline?: boolean;
  status?: 'active' | 'waiting' | 'resolved' | 'archived';
  type?: 'client' | 'writer' | 'support' | 'admin';
  isPinned?: boolean;
  petitionId?: string;
  lastMessageSender?: string;
  messages: ChatMessageItem[];
  category: string;
  notifications: boolean;
  lastSeen?: Date;
}

interface FilePreview {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface ChatMessageItem {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    preview?: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: string[];
    count: number;
  }>;
  edited?: boolean;
  editedAt?: Date;
  isBlocked?: boolean;
  moderationReason?: string;
  replyTo?: string;
}

const ClientChatInner = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState<ExtendedConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ExtendedConversationItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    connectionStatus,
    connectionError,
    isLoading,
    typingUsers,
    onlineUsers,
    sendMessage,
    markAsRead,
    setTyping,
    getUserStatus
  } = useChat({
    userId: 'client-1',
    userType: 'client',
    enableEncryption: true,
    enableTypingIndicator: true
  });

  const {
    filters,
    updateFilters,
    clearFilters,
    filteredItems: searchFilteredConversations,
    isSearching,
    hasActiveFilters,
    highlightText,
    getActiveFiltersCount,
    getActiveFiltersLabels,
    totalResults
  } = useAdvancedSearch(conversations);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const savedConversations = localStorage.getItem('client-chat-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
          lastSeen: conv.lastSeen ? new Date(conv.lastSeen) : undefined,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error('Error loading conversations:', error);
        initializeDefaultConversations();
      }
    } else {
      initializeDefaultConversations();
    }
  }, []);

  // Handle navigation state from petition buttons
  useEffect(() => {
    const navigationState = location.state as any;
    if (navigationState?.autoSelect && navigationState?.writerName && conversations.length > 0) {
      const { chatType, petitionId, writerName, petitionTitle } = navigationState;
      
      // Try to find existing conversation with this writer
      const existingConversation = conversations.find(conv => 
        conv.name === writerName || 
        (conv.petitionId === petitionId && conv.type === 'writer')
      );

      if (!existingConversation) {
        // Create new conversation with the writer
        const newConversation: ExtendedConversationItem = {
          id: `writer-${petitionId}`,
          name: writerName,
          avatar: undefined,
          lastMessage: 'Conversa iniciada',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: true,
          status: 'active',
          type: 'writer',
          isPinned: false,
          petitionId: petitionId,
          lastMessageSender: 'Sistema',
          category: 'Redatores',
          notifications: true,
          lastSeen: new Date(),
          messages: [
            {
              id: `msg-init-${Date.now()}`,
              content: `Olá! Estou aqui para ajudar com sua petição: "${petitionTitle}". Como posso auxiliá-lo?`,
              sender: `writer-${petitionId}`,
              timestamp: new Date(),
              status: 'delivered'
            }
          ]
        };

        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        
        toast({
          title: "Conversa iniciada",
          description: `Conectado com ${writerName}`,
        });
      } else {
        // Select existing conversation
        setSelectedConversation(existingConversation);
        if (existingConversation.unreadCount > 0) {
          handleMarkAsRead(existingConversation.id);
        }
        
        toast({
          title: "Conversa retomada",
          description: `Conectado com ${writerName}`,
        });
      }

      // Switch to writers tab
      setActiveTab('writers');
      
      // Clear navigation state to prevent repeated auto-selection
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [conversations, location.state]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('client-chat-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    const total = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
    setUnreadCount(total);
  }, [conversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  useEffect(() => {
    // Initialize notifications
    notificationManager.requestPermission();
    
    // Update favicon badge based on unread count
    notificationManager.updateFaviconBadge(unreadCount);
    
    // Update page title with unread count
    document.title = unreadCount > 0 ? `(${unreadCount}) Chat Veredicta` : 'Chat Veredicta';
  }, [unreadCount]);

  const initializeDefaultConversations = () => {
    const defaultConversations: ExtendedConversationItem[] = [
      {
        id: 'support-1',
        name: 'Suporte Veredicta',
        avatar: undefined,
        lastMessage: 'Como posso ajudá-lo hoje?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 26),
        unreadCount: 1,
        isOnline: true,
        status: 'active',
        type: 'support',
        isPinned: false,
        petitionId: undefined,
        lastMessageSender: 'Suporte Veredicta',
        category: 'Suporte',
        notifications: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30),
        messages: [
          {
            id: 'msg-1',
            content: 'Olá! Bem-vindo ao suporte da Veredicta.',
            sender: 'support-1',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'read'
          },
          {
            id: 'msg-2',
            content: 'Como posso ajudá-lo hoje?',
            sender: 'support-1',
            timestamp: new Date(Date.now() - 1000 * 60 * 26),
            status: 'delivered'
          },
          {
            id: 'msg-3',
            content: 'Aqui está um documento exemplo com anexo.',
            sender: 'support-1',
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            status: 'delivered',
            attachments: [
              {
                id: 'att-test-1',
                name: 'documento-exemplo.pdf',
                size: 245760, // 240KB
                type: 'application/pdf',
                url: '#'
              },
              {
                id: 'att-test-2',
                name: 'imagem-exemplo.jpg',
                size: 102400, // 100KB
                type: 'image/jpeg',
                url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
              }
            ]
          }
        ]
      }
    ];
    setConversations(defaultConversations);
  };

  const handleSendMessage = async (content: string, attachments?: File[] | FilePreview[]) => {
    if (!selectedConversation || (!content.trim() && !attachments?.length)) return;

    // Content moderation check
    const moderationResult: ModerationResult = await contentModerator.moderateMessage(
      content.trim(),
      'client-1',
      selectedConversation.id
    );

    // Check attachments for inappropriate content
    const attachmentModerationResults: ModerationResult[] = [];
    if (attachments && attachments.length > 0) {
      // Skip moderation for FilePreview type attachments since they don't have the File object
      const isFileArray = attachments[0] && 'lastModified' in attachments[0];
      if (isFileArray) {
        for (const file of attachments as File[]) {
          const result = await contentModerator.moderateImage(file, 'client-1', selectedConversation.id);
          attachmentModerationResults.push(result);
        }
      }
    }

    // Check if message should be blocked
    const isBlocked = moderationResult.isViolation || attachmentModerationResults.some(r => r.isViolation);
    
    if (isBlocked) {
      const reasons = [
        moderationResult.reason,
        ...attachmentModerationResults.map(r => r.reason).filter(Boolean)
      ].filter(Boolean);

      toast({
        title: "🚫 Mensagem Bloqueada",
        description: `Sua mensagem foi bloqueada por violar nossas políticas: ${reasons.join(', ')}`,
        variant: "destructive"
      });

      // Still create the message but mark it as blocked for user awareness
      const blockedMessage: ChatMessageItem = {
        id: `msg-${Date.now()}`,
        content: content.trim() || '[Anexo bloqueado]',
        sender: 'client-1',
        timestamp: new Date(),
        status: 'failed',
        isBlocked: true,
        moderationReason: reasons.join(', '),
      };

      setSelectedConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, blockedMessage]
        };
      });

      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id
            ? {
                ...conv,
                messages: [...conv.messages, blockedMessage],
                lastMessage: 'Mensagem bloqueada',
                lastMessageTime: new Date(),
                lastMessageSender: 'Você'
              }
            : conv
        )
      );
      
      setInputValue('');
      return;
    }

    const newMessage: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      content: content.trim(),
      sender: 'client-1',
      timestamp: new Date(),
      status: 'sending',
      attachments: attachments?.map(file => {
        // Handle both File and FilePreview types
        if ('lastModified' in file) {
          // It's a File object
          const fileObj = file as File;
          return {
            id: `att-${Date.now()}-${fileObj.name}`,
            name: fileObj.name,
            size: fileObj.size,
            type: fileObj.type,
            url: URL.createObjectURL(fileObj),
            preview: fileObj.type.startsWith('image/') ? URL.createObjectURL(fileObj) : undefined
          };
        } else {
          // It's a FilePreview object
          const previewObj = file as FilePreview;
          return {
            id: previewObj.id,
            name: previewObj.name,
            size: previewObj.size,
            type: previewObj.type,
            url: previewObj.preview || '#',
            preview: previewObj.preview
          };
        }
      })
    };

    setSelectedConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: content.trim(),
        lastMessageTime: new Date(),
        lastMessageSender: 'Você'
      };
    });

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: content.trim(),
              lastMessageTime: new Date(),
              lastMessageSender: 'Você'
            }
          : conv
      )
    );

    setInputValue('');

    try {
      const success = await sendMessage(selectedConversation.id, content.trim(), attachments);
      
      if (success) {
        // Update message status to sent
        setSelectedConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'sent' }
                : msg
            )
          };
        });

        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  messages: conv.messages.map(msg => 
                    msg.id === newMessage.id 
                      ? { ...msg, status: 'sent' }
                      : msg
                  )
                }
              : conv
          )
        );
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handleMarkAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
    markAsRead(conversationId);
  };

  const toggleNotifications = (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, notifications: !conv.notifications }
          : conv
      )
    );
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!selectedConversation) return;

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: conv.messages.map(msg => {
                if (msg.id !== messageId) return msg;
                
                const reactions = msg.reactions || [];
                const existingReaction = reactions.find(r => r.emoji === emoji);
                
                if (existingReaction) {
                  // Toggle reaction
                  if (existingReaction.users.includes('client-1')) {
                    // Remove reaction
                    const newUsers = existingReaction.users.filter(u => u !== 'client-1');
                    if (newUsers.length === 0) {
                      return {
                        ...msg,
                        reactions: reactions.filter(r => r.emoji !== emoji)
                      };
                    } else {
                      return {
                        ...msg,
                        reactions: reactions.map(r => 
                          r.emoji === emoji 
                            ? { ...r, users: newUsers, count: newUsers.length }
                            : r
                        )
                      };
                    }
                  } else {
                    // Add reaction
                    const newUsers = [...existingReaction.users, 'client-1'];
                    return {
                      ...msg,
                      reactions: reactions.map(r => 
                        r.emoji === emoji 
                          ? { ...r, users: newUsers, count: newUsers.length }
                          : r
                      )
                    };
                  }
                } else {
                  // New reaction
                  return {
                    ...msg,
                    reactions: [...reactions, {
                      emoji,
                      users: ['client-1'],
                      count: 1
                    }]
                  };
                }
              })
            }
          : conv
      )
    );

    // Update selected conversation
    setSelectedConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map(msg => {
          if (msg.id !== messageId) return msg;
          
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(r => r.emoji === emoji);
          
          if (existingReaction) {
            if (existingReaction.users.includes('client-1')) {
              const newUsers = existingReaction.users.filter(u => u !== 'client-1');
              if (newUsers.length === 0) {
                return {
                  ...msg,
                  reactions: reactions.filter(r => r.emoji !== emoji)
                };
              } else {
                return {
                  ...msg,
                  reactions: reactions.map(r => 
                    r.emoji === emoji 
                      ? { ...r, users: newUsers, count: newUsers.length }
                      : r
                  )
                };
              }
            } else {
              const newUsers = [...existingReaction.users, 'client-1'];
              return {
                ...msg,
                reactions: reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, users: newUsers, count: newUsers.length }
                    : r
                )
              };
            }
          } else {
            return {
              ...msg,
              reactions: [...reactions, {
                emoji,
                users: ['client-1'],
                count: 1
              }]
            };
          }
        })
      };
    });
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!selectedConversation) return;

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === messageId 
                  ? { 
                      ...msg, 
                      content: newContent, 
                      edited: true, 
                      editedAt: new Date() 
                    }
                  : msg
              )
            }
          : conv
      )
    );

    setSelectedConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                content: newContent, 
                edited: true, 
                editedAt: new Date() 
              }
            : msg
        )
      };
    });

    toast({
      title: "Mensagem editada",
      description: "Sua mensagem foi atualizada com sucesso."
    });
  };

  const handleReportMessage = (messageId: string, reason: string, details?: string) => {
    // Create admin notification for the report
    const reportedMessage = selectedConversation?.messages.find(msg => msg.id === messageId);
    if (reportedMessage) {
      // Add to admin notifications
      const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const newNotification = {
        id: `chat-report-${Date.now()}`,
        type: 'chat_report',
        title: 'Nova Denúncia de Chat',
        message: `Mensagem reportada por ${reportedMessage.sender === 'client-1' ? 'Cliente' : 'Usuário'}: ${reason}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        icon: 'Flag',
        reportData: {
          messageId,
          reason,
          details,
          reportedBy: 'client-1',
          reportedUser: reportedMessage.sender,
          reportedUserName: reportedMessage.sender === 'client-1' ? 'Você' : 
                           reportedMessage.sender === 'support-1' ? 'Suporte Veredicta' : 
                           'Sistema',
          conversationId: selectedConversation.id,
          messageContent: reportedMessage.content,
          messageTimestamp: reportedMessage.timestamp.toISOString()
        }
      };
      
      adminNotifications.unshift(newNotification);
      localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
      
      toast({
        title: "Relatório enviado",
        description: "Seu relatório foi enviado para análise dos administradores.",
      });
    }
  };

  // Get all files from conversations
  const getAllFiles = () => {
    const files: any[] = [];
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.attachments) {
          msg.attachments.forEach(att => {
            files.push({
              ...att,
              messageId: msg.id,
              senderId: msg.sender,
              senderName: msg.sender === 'client-1' ? 'Você' : 
                         msg.sender === 'support-1' ? 'Suporte Veredicta' : 
                         'Sistema',
              timestamp: msg.timestamp,
              conversationId: conv.id
            });
          });
        }
      });
    });
    return files;
  };

  const handleDownloadFile = (file: any) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredConversations = searchFilteredConversations.filter(conv => {
    if (activeTab === 'unread') return conv.unreadCount > 0;
    if (activeTab === 'support') return conv.type === 'support';
    if (activeTab === 'writers') return conv.type === 'writer';
    return true;
  });

  return (
    <div className="relative flex h-[calc(100vh-120px)] bg-white text-gray-900">
      {connectionStatus !== 'connected' && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg border ${
            connectionStatus === 'connecting' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
            connectionStatus === 'reconnecting' ? 'bg-orange-100 border-orange-300 text-orange-700' :
            'bg-red-100 border-red-300 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                connectionStatus === 'reconnecting' ? 'bg-orange-500 animate-ping' :
                'bg-red-500'
              }`} />
              <span className="text-sm">
                {connectionStatus === 'connecting' ? 'Conectando...' :
                 connectionStatus === 'reconnecting' ? 'Reconectando...' :
                 connectionError || 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative'
        }
        ${!isMobile ? 'w-96 flex-shrink-0' : ''}
        bg-white border-r border-gray-200 flex flex-col
      `}>
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-none">
          <CardHeader className={isMobile ? "px-4 py-3" : ""}>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Mensagens
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={filters.query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 text-sm"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                <AdvancedSearchModal
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                  totalResults={totalResults}
                  activeFiltersCount={getActiveFiltersCount()}
                  activeFiltersLabels={getActiveFiltersLabels()}
                />
              </div>

              {hasActiveFilters && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {totalResults} resultado{totalResults !== 1 ? 's' : ''} • {getActiveFiltersLabels().join(' • ')}
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-4">
                <TabsTrigger value="all" className="flex-1 text-xs">Todas</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 text-xs">
                  Não lidas
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {conversations.filter(c => c.unreadCount > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="support" className="flex-1 text-xs">Suporte</TabsTrigger>
                <TabsTrigger value="writers" className="flex-1 text-xs">Redatores</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <div className="flex-1 overflow-hidden">
            <ChatConversationList
              conversations={filteredConversations.map(conv => ({
                ...conv,
                isOnline: getUserStatus(conv.id) === 'online'
              }))}
              selectedId={selectedConversation?.id}
              onSelect={(conv) => {
                setSelectedConversation(conv);
                if (conv.unreadCount > 0) {
                  handleMarkAsRead(conv.id);
                }
                if (isMobile) {
                  setIsSidebarOpen(false);
                }
              }}
              onPin={(id) => {
                setConversations(prev => prev.map(conv => 
                  conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
                ));
              }}
              onArchive={(id) => {
                setConversations(prev => prev.map(conv => 
                  conv.id === id ? { ...conv, status: 'archived' } : conv
                ));
              }}
              className="h-full overflow-y-auto"
              showLastSeen={true}
              searchQuery={filters.query}
            />
          </div>
        </Card>
      </div>

      <div className={`flex-1 flex flex-col ${!isMobile ? 'ml-4' : ''} ${isMobile ? 'p-2' : 'p-4'}`}>
        {isMobile && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-white border rounded-lg shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <img src="/src/assets/images/veredicta-logo.png" alt="Veredicta Logo" className="h-6 w-6" />
              <span className="font-semibold text-gray-900">Chat Veredicta</span>
            </div>
            <div className="flex items-center gap-2">
              <FileHistoryPanel 
                files={getAllFiles()}
                onDownload={handleDownloadFile}
              />
            </div>
          </div>
        )}

        {selectedConversation ? (
          <Card className="flex-1 flex flex-col min-h-0">
            <ChatHeader
              name={selectedConversation.name}
              status={getUserStatus(selectedConversation.id)}
              type={selectedConversation.type}
              subtitle={
                selectedConversation.petitionId 
                  ? `Petição #${selectedConversation.petitionId}` 
                  : selectedConversation.lastSeen 
                    ? `Visto ${formatDistanceToNow(selectedConversation.lastSeen, { locale: ptBR, addSuffix: true })}`
                    : undefined
              }
              conversationId={selectedConversation.id}
              petitionId={selectedConversation.petitionId}
              messageCount={selectedConversation.messages.length}
              files={getAllFiles()}
              onDownloadFile={handleDownloadFile}
              showBackButton={isMobile}
              onBack={isMobile ? () => setSelectedConversation(null) : undefined}
              actions={
                <div className="flex items-center gap-1">
                </div>
              }
            />

            <div className={`flex-1 overflow-y-auto space-y-3 min-h-0 ${isMobile ? 'p-3' : 'p-4'}`}>
              {selectedConversation.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    sender: message.sender,
                    senderName: message.sender === 'client-1' ? 'Você' : 
                               message.sender === 'support-1' ? 'Suporte Veredicta' : 
                               'Sistema',
                    senderType: message.sender === 'client-1' ? 'client' : 'support',
                    content: message.content,
                    timestamp: message.timestamp,
                    status: message.status,
                    edited: message.edited,
                    editedAt: message.editedAt,
                    isBlocked: message.isBlocked,
                    moderationReason: message.moderationReason,
                    attachments: message.attachments?.map(att => ({
                      id: att.id,
                      name: att.name,
                      size: att.size,
                      type: att.type,
                      url: att.url,
                      preview: att.preview
                    }))
                  }}
                  currentUserId="client-1"
                  isOwn={message.sender === 'client-1'}
                  onRetry={(messageId) => {
                    const failedMessage = selectedConversation.messages.find(m => m.id === messageId);
                    if (failedMessage) {
                      handleSendMessage(failedMessage.content, failedMessage.attachments);
                    }
                  }}
                  onEdit={handleEditMessage}
                  onReport={handleReportMessage}
                  showTimestamp={true}
                  showReadReceipts={true}
                />
              ))}
              
              {typingUsers.filter(user => user.conversationId === selectedConversation.id).length > 0 && (
                <TypingIndicator 
                  users={typingUsers.filter(user => user.conversationId === selectedConversation.id)} 
                  showAvatar={true}
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className={isMobile ? 'p-2' : 'p-0'}>
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
                onTyping={(isTyping) => setTyping(selectedConversation.id, isTyping)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                quickReplies={[
                  "Obrigado!",
                  "Quando fica pronto?",
                  "Preciso de ajuda"
                ]}
                showQuickReplies={!isMobile}
              />
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 p-6">
              <MessageSquare className={`mx-auto mb-4 text-gray-300 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Suas Conversas</h3>
              <p className={isMobile ? 'text-sm' : ''}>
                {isMobile ? 'Toque no menu para ver conversas' : 'Selecione uma conversa para começar o chat'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const ClientChat = () => {
  return <ClientChatInner />;
};

export default ClientChat;
