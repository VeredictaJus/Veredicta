import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ImageModal } from '@/components/ui/image-modal';
import { ClickableImage } from '@/components/ui/clickable-image';
import { useChat } from '@/contexts/ChatContext';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { Message, ConversationParticipant, ChatService } from '@/services/chatService';
import { ParticipantService } from '@/services/participantService';
import { Send, Paperclip, MoreVertical, Users, Mic, Square, Play, Pause, RefreshCw, File, FileText, Image, Download, Eye, Archive, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { filterSensitiveInfo, containsSensitiveInfo } from '@/utils/messageFilter';
import { checkImageForSensitiveInfo, shouldProcessImage } from '@/utils/imageTextDetector';
import { toast } from 'sonner';
import './ChatWindow.module.css';
import '@/styles/chat-fixes.css';

// Componente de Player de Áudio
interface AudioPlayerProps {
  audioUrl: string;
  fileName?: string;
  fileSize?: number;
  isOwnMessage: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  fileName, 
  fileSize, 
  isOwnMessage 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    setAudioElement(audio);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioElement) return;

    try {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      alert('Erro ao reproduzir áudio. Tente novamente.');
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-muted rounded-lg p-3 border border-white/20 ${isOwnMessage ? 'bg-primary/10' : 'bg-muted'}`}>
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className={`h-10 w-10 p-0 rounded-full ${
            isOwnMessage 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-white">
              🎵 Mensagem de áudio
            </span>
            <span className="text-xs text-white/80">
              • {fileSize ? `${Math.round(fileSize / 1024)} KB` : 'Áudio'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-white/70 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className={`rounded-full h-1 ${isOwnMessage ? 'bg-primary/30' : 'bg-muted-foreground/30'}`}>
            <div 
              className={`h-1 rounded-full transition-all duration-100 ${
                isOwnMessage ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChatWindowProps {
  conversationId?: string;
  onClose?: () => void;
}

export default function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  // 🚀 CORREÇÃO: Verificação defensiva do ChatContext
  let chatContext;
  try {
    chatContext = useChat();
  } catch (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Chat não disponível no momento. Tente recarregar a página.
      </div>
    );
  }
  
  const {
    currentConversation,
    messages: contextMessages,
    participants,
    sendMessage,
    loadOlderMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    markAsRead,
    updateConversationStatus,
    isLoading,
    error,
    selectConversation,
    loadConversations,
    loadConversationMessages
  } = chatContext;
  
  const { user } = useNewAuth();

  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevMessagesRef = useRef<Message[]>([]);

  // ✅ CORREÇÃO CRÍTICA: Usar useLayoutEffect para setar transição SINCRONAMENTE antes do render
  // Isso garante que o avatar seja ocultado imediatamente quando conversationId muda
  useLayoutEffect(() => {
    if (conversationId && conversationId !== currentConversation?.id) {
      // ✅ CORREÇÃO CRÍTICA: Marcar como em transição IMEDIATAMENTE (síncrono) para ocultar avatar
      setIsTransitioning(true);
    } else if (conversationId && currentConversation?.id === conversationId) {
      // ✅ CORREÇÃO: Se já está sincronizado, garantir que não está em transição
      setIsTransitioning(false);
    } else if (!conversationId) {
      // ✅ CORREÇÃO: Se não há conversationId, não está em transição
      setIsTransitioning(false);
    }
  }, [conversationId, currentConversation?.id]);

  // Selecionar conversa quando conversationId for passado como prop
  useEffect(() => {
    if (conversationId && conversationId !== currentConversation?.id) {
      // ✅ CORREÇÃO: NÃO limpar mensagens aqui - deixar o outro useEffect fazer isso após carregar
      // Isso evita que as mensagens desapareçam e reapareçam (flash)
      
      // ✅ CORREÇÃO: Aguardar selectConversation para garantir que as mensagens sejam carregadas
      selectConversation(conversationId)
        .then(() => {
          // ✅ CORREÇÃO: Aguardar um pouco mais para garantir que as mensagens foram processadas
          setTimeout(() => {
            startTransition(() => {
              setIsTransitioning(false);
            });
          }, 100);
        })
        .catch((error) => {
          console.error('Erro ao selecionar conversa:', error);
          setIsTransitioning(false);
          // Se a conversa não existir, tentar recarregar as conversas primeiro
          loadConversations().then(() => {
            selectConversation(conversationId).catch((err) => {
              console.error('Erro ao selecionar conversa após recarregar:', err);
            });
          });
        });
    } else if (!conversationId && currentConversation) {
      // Se não há conversationId mas há currentConversation, limpar
      setIsTransitioning(false);
    }
  }, [conversationId, currentConversation?.id, selectConversation, loadConversations]);

  useEffect(() => {
    // ✅ CORREÇÃO: Filtrar mensagens apenas da conversa atual para evitar mostrar mensagens de outras conversas
    // ✅ CORREÇÃO: Verificar se conversationId corresponde ao currentConversation.id para evitar mostrar dados da conversa errada
    const targetConversationId = conversationId || currentConversation?.id;
    
    if (targetConversationId && currentConversation?.id === targetConversationId) {
      const filteredMessages = contextMessages.filter(
        (msg) => msg.conversation_id === targetConversationId
      );
      
      // ✅ CORREÇÃO: Verificar se as mensagens realmente mudaram antes de atualizar
      // Usar um hash simples para comparar se as mensagens mudaram
      const currentMessagesHash = filteredMessages.map(m => m.id).join(',');
      const prevMessagesHash = prevMessagesRef.current
        .filter((msg) => msg.conversation_id === targetConversationId)
        .map(m => m.id)
        .join(',');
      
      // Se as mensagens não mudaram (mesmos IDs na mesma ordem), não atualizar
      if (currentMessagesHash === prevMessagesHash && currentMessagesHash !== '') {
        return; // Não atualizar se nada mudou
      }
      
      // ✅ CORREÇÃO: Sempre atualizar mensagens quando há conversa selecionada (mesmo se vazio)
      startTransition(() => {
        // ✅ CORREÇÃO: Mesclar mensagens otimistas (temporárias) com as do contexto
        // Manter mensagens otimistas que ainda não foram confirmadas
        setMessages(prev => {
          // Filtrar apenas mensagens da conversa atual do estado anterior
          const prevFiltered = prev.filter(msg => msg.conversation_id === targetConversationId);
          
          // Manter mensagens otimistas que ainda não foram confirmadas
          const optimisticMessages = prevFiltered.filter(msg => msg.id.startsWith('temp-') || msg.id.startsWith('tmp-'));
          
          // Se não há mensagens confirmadas ainda, retornar apenas otimistas
          // ✅ CORREÇÃO: Se há mensagens otimistas e não há confirmadas, manter as otimistas
          // Se não há nem otimistas nem confirmadas, retornar array vazio (não limpar se houver otimistas)
          if (filteredMessages.length === 0) {
            // ✅ CORREÇÃO: Atualizar ref mesmo quando não há mensagens confirmadas
            prevMessagesRef.current = filteredMessages;
            // Se há mensagens otimistas, manter elas; caso contrário, verificar se há mensagens anteriores
            if (optimisticMessages.length > 0) {
              return optimisticMessages;
            }
            // Se não há otimistas e não há confirmadas, manter o estado anterior (não limpar)
            // Isso evita que mensagens desapareçam enquanto estão sendo carregadas
            const currentMessagesForConversation = prev.filter(msg => msg.conversation_id === targetConversationId);
            if (currentMessagesForConversation.length > 0) {
              return currentMessagesForConversation;
            }
            return optimisticMessages; // Array vazio se não há nada
          }
          
          // ✅ OTIMIZAÇÃO: Usar Map para lookup O(1) ao invés de O(n) com .some()
          const confirmedMessagesMap = new Map<string, Message>();
          const timeCache = new Map<string, number>();
          
          filteredMessages.forEach(msg => {
            if (!timeCache.has(msg.created_at)) {
              timeCache.set(msg.created_at, new Date(msg.created_at).getTime());
            }
            const timeWindow = Math.floor(timeCache.get(msg.created_at)! / 5000) * 5000;
            const key = `${msg.content}|${msg.sender_id}|${timeWindow}`;
            confirmedMessagesMap.set(key, msg);
          });
          
          // ✅ OTIMIZAÇÃO: Verificar confirmação usando Map (O(1) lookup)
          const remainingOptimistic = optimisticMessages.filter(optMsg => {
            if (!timeCache.has(optMsg.created_at)) {
              timeCache.set(optMsg.created_at, new Date(optMsg.created_at).getTime());
            }
            const timeWindow = Math.floor(timeCache.get(optMsg.created_at)! / 5000) * 5000;
            const key = `${optMsg.content}|${optMsg.sender_id}|${timeWindow}`;
            return !confirmedMessagesMap.has(key);
          });
          
          // Combinar mensagens confirmadas com otimistas restantes
          const allMessages = [...filteredMessages, ...remainingOptimistic];
          
          // ✅ OTIMIZAÇÃO: Usar Map para remover duplicatas (mais eficiente)
          const uniqueMessagesMap = new Map<string, Message>();
          allMessages.forEach(msg => {
            if (!uniqueMessagesMap.has(msg.id) || (!msg.id.startsWith('temp-') && !msg.id.startsWith('tmp-'))) {
              uniqueMessagesMap.set(msg.id, msg);
            }
          });
          
          // ✅ OTIMIZAÇÃO: Sort usando cache de timestamps (evita múltiplas conversões)
          const uniqueMessages = Array.from(uniqueMessagesMap.values());
          const sortedMessages = uniqueMessages.sort((a, b) => {
            const timeA = timeCache.get(a.created_at) ?? new Date(a.created_at).getTime();
            const timeB = timeCache.get(b.created_at) ?? new Date(b.created_at).getTime();
            return timeA - timeB;
          });
          
          // ✅ CORREÇÃO: Atualizar ref APENAS quando realmente atualizar o estado
          // Atualizar com mensagens filtradas (confirmadas) do contexto, não todas as mensagens
          // Isso garante que o ref seja atualizado apenas quando houver uma mudança real
          prevMessagesRef.current = filteredMessages;
          
          return sortedMessages;
        });
      });
    } else if (!targetConversationId) {
      // Se não há conversa selecionada, limpar mensagens
      startTransition(() => {
        setMessages([]);
      });
      prevMessagesRef.current = [];
    }
  }, [contextMessages, currentConversation?.id, conversationId]);
  
  // Função para forçar recarregamento das mensagens
  const forceReloadMessages = async () => {
    if (!currentConversation) return;
    
    try {
      // Usar a função do contexto para garantir que as mensagens sejam atualizadas corretamente
      await loadConversationMessages(currentConversation.id);
      toast.success('Mensagens recarregadas');
    } catch (error) {
      console.error('Erro ao recarregar mensagens:', error);
      toast.error('Erro ao recarregar mensagens');
    }
  };
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const isProcessingDropRef = useRef(false);
  const isSendingFileRef = useRef(false);
  const lastProcessedFileRef = useRef<{ name: string; size: number; timestamp: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const skipAutoScrollRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);

  // Função para verificar se está próximo do final
  // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para evitar reflow forçado
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;
    
    // ✅ Agrupar leituras de layout em um único frame
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Considera "próximo do final" se estiver a menos de 100px do final
    return distanceFromBottom < 100;
  }, []);

  // Handler de scroll para detectar quando o usuário está rolando
  // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para evitar reflow forçado
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // ✅ Agrupar leitura de layout em um único frame
    requestAnimationFrame(() => {
      if (!container) return;
      const currentScrollTop = container.scrollTop;
      const scrollDirection = currentScrollTop < lastScrollTopRef.current ? 'up' : 'down';
      lastScrollTopRef.current = currentScrollTop;

    // Se o usuário está rolando para cima, definitivamente não fazer scroll automático
    if (scrollDirection === 'up') {
      isUserScrollingRef.current = true;
      isNearBottomRef.current = false;
      
      // Manter bloqueado por mais tempo quando rolando para cima
      // ✅ OTIMIZAÇÃO: Usar requestIdleCallback para evitar violations
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            isUserScrollingRef.current = false;
            // Verificar novamente se está no final após parar de rolar
            isNearBottomRef.current = checkIfNearBottom();
          }, { timeout: 100 });
        } else {
          requestAnimationFrame(() => {
            isUserScrollingRef.current = false;
            isNearBottomRef.current = checkIfNearBottom();
          });
        }
      }, 1000);
      return;
    }

    // Se está rolando para baixo, atualizar estado mas não bloquear tanto
    isUserScrollingRef.current = true;
    isNearBottomRef.current = checkIfNearBottom();

    // Resetar flag após um tempo
    // ✅ OTIMIZAÇÃO: Usar requestIdleCallback para evitar violations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          isUserScrollingRef.current = false;
        }, { timeout: 100 });
      } else {
        requestAnimationFrame(() => {
          isUserScrollingRef.current = false;
        });
      }
    }, 800);
    });
  }, [checkIfNearBottom]);

  // Função para abrir modal de imagem
  const openImageModal = (imageUrl: string, fileName?: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageName(fileName || 'Imagem');
    setImageModalOpen(true);
  };

  // Função para fechar modal de imagem
  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImageUrl('');
    setSelectedImageName('');
  };

  const getOtherParticipant = (): ConversationParticipant | null => {
    if (!participants.length) return null;
    if (!user?.uid) return participants[0] ?? null;
    
    // Para conversas de suporte, a lógica depende de quem está visualizando:
    // - Se é ADMIN: o outro participante é CLIENTE ou REDATOR
    // - Se é CLIENTE ou REDATOR: o outro participante é ADMIN/SUPORTE
    if (currentConversation?.type === 'support') {
      const userRole = user.role || 'client';
      
      if (userRole === 'admin') {
        // Admin visualizando: buscar cliente ou redator (não admin/suporte)
        const clientOrWriterParticipant = participants.find(p => 
          p.user_id !== user.uid && 
          p.user_id !== 'support-admin' &&
          p.role !== 'support' &&
          p.role !== 'admin'
        );
        
        if (clientOrWriterParticipant) {
          return clientOrWriterParticipant;
        }
      } else {
        // Cliente ou Redator visualizando: buscar admin/suporte
        const adminOrSupportParticipant = participants.find(p => 
          p.user_id !== user.uid && 
          (p.role === 'admin' || p.role === 'support' || p.user_id === 'support-admin')
        );
        
        if (adminOrSupportParticipant) {
          return adminOrSupportParticipant;
        }
      }
      
      // Fallback: qualquer participante que não seja o usuário atual
      return participants.find(p => p.user_id !== user.uid) ?? null;
    }
    
    // Para outras conversas, retornar qualquer participante que não seja o usuário atual
    return participants.find(p => p.user_id !== user.uid) ?? null;
  };

  const resolveParticipantName = (participant?: ConversationParticipant | null): string => {
    if (!participant) return '';

    const possibleNames = [
      (participant as any).display_name,
      (participant as any).user_name,
      participant.user?.name,
      (participant.user as any)?.full_name,
      (participant.user as any)?.email ? (participant.user as any).email.split('@')[0] : null,
      // Só adicionar "Suporte Veredicta" se o role for realmente 'support' E não for o usuário atual
      participant.role === 'support' && participant.user_id !== user?.uid ? 'Suporte Veredicta' : null,
    ].filter(Boolean) as string[];

    const metadata = (participant as any).metadata || {};
    if (metadata.full_name) possibleNames.unshift(metadata.full_name);
    if (metadata.name) possibleNames.unshift(metadata.name);

    if (possibleNames.length > 0) {
      return possibleNames[0];
    }

    // Só retornar "Suporte Veredicta" se for realmente suporte e não for o usuário atual
    if (participant.role === 'support' && participant.user_id !== user?.uid) {
      return 'Suporte Veredicta';
    }

    return participant.user_id;
  };

  const getMetadataDisplayName = (): string | null => {
    if (!currentConversation?.metadata) {
      return null;
    }
    const metadata = currentConversation.metadata as any;
    const name = 
      metadata.otherParticipantName ||
      metadata.other_participant_name ||
      metadata.partnerName ||
      metadata.partner_name ||
      null;
    
    return name;
  };

  const getMetadataAvatar = (): { avatarUrl?: string; initials?: string } => {
    if (!currentConversation?.metadata) return {};
    const metadata = currentConversation.metadata as any;
    return {
      avatarUrl: metadata.avatar_url || metadata.partnerAvatar || metadata.partner_avatar,
      initials: metadata.initials || metadata.partnerInitials || metadata.partner_initials,
    };
  };

  // Obter nome de exibição da conversa
  const getConversationDisplayName = (): string => {
    if (!currentConversation) return '';
    
    const otherParticipant = getOtherParticipant();
    const metadataName = getMetadataDisplayName();
    const userRole = user?.role || 'client';

    // PRIORIDADE 1: Para conversas de suporte, a lógica depende de quem está visualizando
    if (currentConversation.type === 'support') {
      // Se é admin visualizando, mostrar nome do cliente/redator
      if (userRole === 'admin') {
        // Primeiro tentar pelo metadata (otherParticipantName) - mais confiável
        if (metadataName && metadataName !== 'Usuário' && metadataName !== 'Suporte Veredicta') {
          return metadataName;
        }
        
        // Se há outro participante, buscar o nome dele de forma mais robusta
        if (otherParticipant) {
          // PRIORIDADE 1: Metadata do participante
          const participantMetadata = (otherParticipant as any).metadata || {};
          if (participantMetadata.full_name && participantMetadata.full_name !== 'Suporte Veredicta') {
            return participantMetadata.full_name;
          }
          if (participantMetadata.name && participantMetadata.name !== 'Suporte Veredicta') {
            return participantMetadata.name;
          }
          
          // PRIORIDADE 2: User object do participante
          const possibleNames = [
            otherParticipant.user?.name,
            (otherParticipant.user as any)?.full_name,
            (otherParticipant as any).display_name,
            (otherParticipant as any).user_name,
            (otherParticipant.user as any)?.email ? (otherParticipant.user as any).email.split('@')[0] : null,
          ].filter(Boolean) as string[];
          
          if (possibleNames.length > 0 && possibleNames[0] !== 'Suporte Veredicta' && possibleNames[0] !== 'Usuário') {
            return possibleNames[0];
          }
          
          // PRIORIDADE 3: Usar getUserDisplayName como fallback
          const name = getUserDisplayName(otherParticipant);
          if (name && name !== 'Suporte Veredicta' && name !== 'Usuário') {
            return name;
          }
        }
        
        // Último fallback para admin
        return 'Cliente';
      } else {
        // Se é cliente/redator visualizando, mostrar "Suporte Veredicta"
        return 'Suporte Veredicta';
      }
    }

    // Para outras conversas, também priorizar metadata
    if (metadataName && metadataName !== 'Usuário') {
      return metadataName;
    }

    if (otherParticipant) {
      const name = getUserDisplayName(otherParticipant);
      if (name && name !== 'Usuário') {
        return name;
      }
    }

    if (currentConversation.type === 'petition') {
      const displayId = (currentConversation as any).metadata?.petitionDisplayId;
      if (displayId) {
        return `Petição ${displayId}`;
      }
    }

    // Só usar título como último recurso
    return currentConversation.title || 'Conversa';
  };


  // Scroll para última mensagem
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para ler propriedades após o layout ser calculado
      // Isso evita forced reflow ao ler scrollHeight/clientHeight antes do navegador recalcular
      if (messagesEndRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        
        // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para garantir que o layout já foi calculado
        requestAnimationFrame(() => {
          const targetScrollTop = container.scrollHeight - container.clientHeight;
          
          // ✅ OTIMIZAÇÃO: Usar scrollTo ao invés de scrollIntoView para melhor performance
          if (behavior === 'smooth') {
            container.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
          } else {
            container.scrollTop = targetScrollTop;
          }
          
          // Atualizar estado de forma assíncrona
          setTimeout(() => {
            isNearBottomRef.current = true;
          }, 0);
        });
      }
    },
    []
  );

  // Scroll automático apenas se o usuário estiver no final ou se for mensagem própria
  useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }

    // Se o usuário está fazendo scroll manualmente, NUNCA fazer scroll automático
    if (isUserScrollingRef.current) {
      return;
    }

    // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para ler propriedades após o layout ser calculado
    // Isso evita forced reflow ao verificar scrollHeight/scrollTop antes do navegador recalcular
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      // Verificar novamente se está próximo do final (atualizar estado)
      isNearBottomRef.current = checkIfNearBottom();

      // Se não está próximo do final, não fazer scroll automático
      if (!isNearBottomRef.current) {
        return;
      }

      // Verificar se a última mensagem é do próprio usuário
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage && user?.uid && lastMessage.sender_id === user.uid;

      // Só fazer scroll automático se:
      // 1. O usuário está próximo do final (já estava vendo as mensagens mais recentes), OU
      // 2. É uma mensagem própria (o usuário acabou de enviar)
      if (isNearBottomRef.current || isOwnMessage) {
        scrollToBottom();
      }
    });
  }, [messages, scrollToBottom, user?.uid, checkIfNearBottom]);

  const handleLoadOlderMessages = useCallback(async () => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    skipAutoScrollRef.current = true;
    
    // ✅ OTIMIZAÇÃO: Ler propriedades de layout antes de modificar o DOM
    const previousHeight = container.scrollHeight;
    const previousTop = container.scrollTop;

    const loaded = await loadOlderMessages();

    if (loaded === 0) {
      skipAutoScrollRef.current = false;
      return;
    }

    // ✅ OTIMIZAÇÃO: Usar double RAF para garantir que o layout foi atualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          return;
        }
        // Agrupar leitura e escrita de layout
        const newHeight = scrollContainerRef.current.scrollHeight;
        scrollContainerRef.current.scrollTop =
          newHeight - previousHeight + previousTop;
      });
    });
  }, [loadOlderMessages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para agrupar leituras de layout
    const onScroll = () => {
      requestAnimationFrame(() => {
        if (!container) return;
        // Atualizar estado de proximidade do final
        isNearBottomRef.current = checkIfNearBottom();
        
        // Agrupar leitura de scrollTop
        const scrollTop = container.scrollTop;
        if (
          scrollTop <= 80 &&
          hasMoreOlderMessages &&
          !isLoadingOlderMessages
        ) {
          void handleLoadOlderMessages();
        }
      });
    };

    container.addEventListener('scroll', onScroll);
    return () => {
      container.removeEventListener('scroll', onScroll);
    };
  }, [handleLoadOlderMessages, hasMoreOlderMessages, isLoadingOlderMessages, checkIfNearBottom]);

  // Marcar mensagens como lidas quando visualizadas
  useEffect(() => {
    const unreadMessages = messages.filter(m => 
      m.sender_id !== currentConversation?.created_by && 
      m.status !== 'read'
    );
    
    unreadMessages.forEach(message => {
      markAsRead(message.id);
    });
  }, [messages, currentConversation, markAsRead]);

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return;

    const content = messageInput.trim();
    
    // 🔒 FILTRAR INFORMAÇÕES SENSÍVEIS
    const filteredContent = filterSensitiveInfo(content);
    
    // Verificar se houve filtragem e avisar o usuário
    if (containsSensitiveInfo(content)) {
      toast.warning('⚠️ Conteúdo sensível ou inadequado foi filtrado', {
        description: 'Por segurança, não compartilhe dados pessoais nem linguagem inapropriada no chat.',
        duration: 5000
      });
    }
    
    const tempId = `temp-${Date.now()}`;
    setMessageInput('');
    setIsTyping(true);

    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: currentConversation.id,
      sender_id: user?.uid ?? 'me',
      content: filteredContent,
      message_type: 'text',
      status: 'sending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: {
        id: user?.uid ?? 'me',
        name: user?.profile?.full_name || user?.email || 'Você',
        role: currentConversation.type === 'support' ? 'client' : (currentConversation.type ?? 'client'),
      },
    };

    // Adicionar mensagem otimista
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await sendMessage(filteredContent); // Envia a mensagem filtrada
      // Se chegou aqui, a mensagem foi enviada com sucesso
      // A mensagem otimista será substituída pela mensagem real quando chegar via real-time
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Remover mensagem otimista em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast.error('Erro ao enviar mensagem. Tente novamente.', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Enviar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Iniciar gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Parar o stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer para mostrar tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  // Parar gravação de áudio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Cancelar gravação
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Enviar áudio
  const sendAudio = async () => {
    if (!audioBlob || !currentConversation) return;
    
    setIsTyping(true);
    try {
      // Por enquanto, vamos usar uma URL simulada até configurar o Supabase Storage
      const simulatedUrl = `data:audio/wav;base64,${await blobToBase64(audioBlob)}`;
      
      await sendMessage('🎵 Áudio enviado', 'file', {
        url: simulatedUrl,
        name: 'audio.wav',
        size: audioBlob.size
      });
      
      // Limpar áudio após envio
      setAudioBlob(null);
      setAudioUrl(null);
      
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      alert('Erro ao enviar áudio. Tente novamente.');
    } finally {
      setIsTyping(false);
    }
  };

  // Função auxiliar para converter Blob para Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove o prefixo data:audio/wav;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Formatar tempo de gravação
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para lidar com seleção de arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Função para processar arquivo (usada tanto no input quanto no drag and drop)
  const processFile = useCallback((file: File, skipProcessingCheck = false) => {
    // Prevenir processamento se já estiver enviando (mas não bloquear se for drag and drop)
    if (!skipProcessingCheck && (isSendingFileRef.current || isUploading)) {
      return;
    }
    
    // Prevenir processamento do mesmo arquivo em um curto período (1 segundo)
    const now = Date.now();
    if (lastProcessedFileRef.current) {
      const { name, size, timestamp } = lastProcessedFileRef.current;
      if (name === file.name && size === file.size && (now - timestamp) < 1000) {
        // Mesmo arquivo processado há menos de 1 segundo - ignorar
        return;
      }
    }
    
    // Registrar arquivo processado
    lastProcessedFileRef.current = {
      name: file.name,
      size: file.size,
      timestamp: now
    };
    
    // Verificar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'Tamanho máximo permitido: 10MB'
      });
      return;
    }
    setSelectedFile(file);
  }, [isUploading]);

  // Handlers para drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar se há arquivos sendo arrastados
    if (e.dataTransfer.types.includes('Files')) {
      if (currentConversation && currentConversation.status !== 'archived') {
        dragCounterRef.current = 0;
        setIsDragOver(true);
      }
    }
  }, [currentConversation]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.types.includes('Files')) {
      dragCounterRef.current += 1;
      if (currentConversation && currentConversation.status !== 'archived') {
        setIsDragOver(true);
      }
    }
  }, [currentConversation]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current -= 1;
    
    // Só desativar quando realmente sair da área (contador chegar a 0)
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir processamento duplicado
    if (isProcessingDropRef.current) {
      return;
    }
    
    dragCounterRef.current = 0;
    setIsDragOver(false);

    if (!currentConversation) {
      toast.error('Nenhuma conversa selecionada', {
        description: 'Selecione uma conversa para enviar arquivos'
      });
      return;
    }

    if (currentConversation.status === 'archived') {
      toast.error('Conversa arquivada', {
        description: 'Não é possível enviar arquivos em conversas arquivadas'
      });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      return;
    }

    // Por enquanto, processar apenas o primeiro arquivo
    const fileToProcess = files[0];
    
    // Verificar se não é o mesmo arquivo que acabou de ser processado
    const now = Date.now();
    if (lastProcessedFileRef.current) {
      const { name, size, timestamp } = lastProcessedFileRef.current;
      if (name === fileToProcess.name && size === fileToProcess.size && (now - timestamp) < 2000) {
        // Mesmo arquivo processado há menos de 2 segundos - ignorar
        return;
      }
    }
    
    // Registrar arquivo processado
    lastProcessedFileRef.current = {
      name: fileToProcess.name,
      size: fileToProcess.size,
      timestamp: now
    };
    
    // Verificar tamanho do arquivo (máximo 10MB)
    if (fileToProcess.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'Tamanho máximo permitido: 10MB'
      });
      return;
    }
    
    // ✅ CORREÇÃO: Setar flag APENAS quando realmente for processar
    isProcessingDropRef.current = true;
    isSendingFileRef.current = true;
    setIsUploading(true);
    
    try {
      // 🔒 VERIFICAR SE É IMAGEM E SE CONTÉM INFORMAÇÕES SENSÍVEIS
      if (fileToProcess.type.startsWith('image/') && shouldProcessImage(fileToProcess)) {
        toast.info('🔍 Verificando imagem...', {
          description: 'Analisando a imagem para proteger suas informações pessoais.',
          duration: 3000
        });
        
        const { hasSensitiveInfo, reason } = await checkImageForSensitiveInfo(fileToProcess);
        
        if (hasSensitiveInfo) {
          toast.error('🚫 Imagem bloqueada', {
            description: reason || 'A imagem contém informações pessoais (telefone, CPF, email, etc.). Por segurança, não é permitido enviar imagens com esses dados.',
            duration: 8000
          });
          return;
        }
        
        toast.success('✅ Imagem verificada e aprovada');
      }
      
      // Converter para base64
      const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileToProcess);
      });

      // Determinar tipo de mensagem
      let messageType: 'file' | 'image' = 'file';
      if (fileToProcess.type.startsWith('image/')) {
        messageType = 'image';
      }

      await sendMessage(
        '📎 Arquivo anexado',
        messageType,
        {
          url: fileUrl,
          name: fileToProcess.name,
          size: fileToProcess.size
        }
      );

      toast.success('✅ Arquivo enviado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast.error('Erro ao enviar arquivo', {
        description: 'Tente novamente'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        isProcessingDropRef.current = false;
        isSendingFileRef.current = false;
      }, 500);
    }
  }, [currentConversation, sendMessage]);

  // Função para enviar arquivo
  const sendFile = async () => {
    if (!selectedFile || !currentConversation) return;
    
    // Prevenir envio duplicado
    if (isSendingFileRef.current || isUploading) {
      return;
    }
    
    isSendingFileRef.current = true;
    setIsUploading(true);
    try {
      // 🔒 VERIFICAR SE É IMAGEM E SE CONTÉM INFORMAÇÕES SENSÍVEIS
      if (selectedFile.type.startsWith('image/') && shouldProcessImage(selectedFile)) {
        toast.info('🔍 Verificando imagem...', {
          description: 'Analisando a imagem para proteger suas informações pessoais.',
          duration: 3000
        });
        
        const { hasSensitiveInfo, reason } = await checkImageForSensitiveInfo(selectedFile);
        
        if (hasSensitiveInfo) {
          toast.error('🚫 Imagem bloqueada', {
            description: reason || 'A imagem contém informações pessoais (telefone, CPF, email, etc.). Por segurança, não é permitido enviar imagens com esses dados.',
            duration: 8000
          });
          
          setSelectedFile(null);
          setIsUploading(false);
          return; // Bloquear envio
        }
        
        toast.success('✅ Imagem verificada e aprovada');
      }
      
      // Por enquanto, vamos simular o upload convertendo para base64
      // Em produção, você faria upload para o Supabase Storage
      const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Determinar tipo de mensagem baseado no tipo do arquivo
      let messageType: 'file' | 'image' = 'file';
      if (selectedFile.type.startsWith('image/')) {
        messageType = 'image';
      }

      await sendMessage(
        '📎 Arquivo anexado',
        messageType,
        {
          url: fileUrl,
          name: selectedFile.name,
          size: selectedFile.size
        }
      );

      // Limpar arquivo selecionado
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast.error('Erro ao enviar arquivo', {
        description: 'Tente novamente'
      });
    } finally {
      setIsUploading(false);
      // Resetar flag após um pequeno delay
      setTimeout(() => {
        isSendingFileRef.current = false;
      }, 500);
    }
  };

  // Função para cancelar seleção de arquivo
  const cancelFileSelection = () => {
    setSelectedFile(null);
  };

  // Função para mostrar/ocultar participantes
  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  // Função para mostrar/ocultar menu
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Função para arquivar/desarquivar conversa
  const archiveConversation = async () => {
    if (!currentConversation) return;
    
    const isCurrentlyArchived = currentConversation.status === 'archived';
    const isSystemArchived = (currentConversation as any).metadata?.system_archived === true;
    
    // 🚫 IMPEDIR desarquivamento de conversas arquivadas pelo sistema
    if (isCurrentlyArchived && isSystemArchived) {
      toast.error('Esta conversa foi arquivada automaticamente pelo sistema e não pode ser desarquivada');
      setShowMenu(false);
      return;
    }
    
    try {
      if (isCurrentlyArchived) {
        // Desarquivar: mudar status para 'active'
        await updateConversationStatus('active');
        setShowMenu(false);
        toast.success('Conversa desarquivada');
      } else {
        // Arquivar: mudar status para 'archived'
        await updateConversationStatus('archived');
        setShowMenu(false);
        toast.success('Conversa arquivada');
      }
    } catch (error) {
      console.error('Erro ao alterar status da conversa:', error);
      const action = isCurrentlyArchived ? 'desarquivar' : 'arquivar';
      toast.error(`Erro ao ${action} conversa`);
    }
  };

  // Função para fechar conversa
  const closeConversation = async () => {
    if (!currentConversation) return;
    
    try {
      // Usar a função do contexto para garantir que o estado seja atualizado imediatamente
      await updateConversationStatus('closed');
      setShowMenu(false);
      toast.success('Conversa fechada');
    } catch (error) {
      console.error('Erro ao fechar conversa:', error);
      toast.error('Erro ao fechar conversa');
    }
  };

  // Função para obter ícone do tipo de arquivo
  const getFileIcon = (fileName: string, fileUrl?: string) => {
    if (!fileName && !fileUrl) return <File className="h-4 w-4" />;
    
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    // Imagens
    if (fileUrl?.startsWith('data:image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    
    // PDFs
    if (extension === 'pdf') {
      return <FileText className="h-4 w-4" />;
    }
    
    // Documentos
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    }
    
    // Arquivos compactados
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <File className="h-4 w-4" />;
    }
    
    // Áudio
    if (fileUrl?.startsWith('data:audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
      return <Play className="h-4 w-4" />;
    }
    
    return <File className="h-4 w-4" />;
  };

  // Função para obter cor do ícone baseado no tipo
  const getFileIconColor = (fileName: string, fileUrl?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (fileUrl?.startsWith('data:image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'text-green-600';
    }
    
    if (extension === 'pdf') {
      return 'text-red-600';
    }
    
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return 'text-blue-600';
    }
    
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return 'text-purple-600';
    }
    
    if (fileUrl?.startsWith('data:audio/') || ['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return 'text-orange-600';
    }
    
    return 'text-gray-600';
  };

  // Função para fazer download de arquivo base64
  const downloadFile = (fileUrl: string, fileName: string) => {
    try {
      if (fileUrl.startsWith('data:')) {
        // Para arquivos base64
        // Criar elemento link temporário
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.style.display = 'none';
        
        // Adicionar ao DOM
        document.body.appendChild(link);
        
        // Simular clique para iniciar download
        link.click();
        
        // Limpar após um pequeno delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 100);
      } else {
        // Para URLs externas
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer download:', error);
      
      // Fallback: tentar abrir em nova aba
      try {
        window.open(fileUrl, '_blank');
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
        alert('Erro ao fazer download do arquivo. Tente clicar com o botão direito e "Salvar como..."');
      }
    }
  };

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Evitar scroll automático quando áudio aparece
  // ✅ OTIMIZAÇÃO: Usar requestAnimationFrame para evitar reflow forçado
  useEffect(() => {
    if (audioBlob) {
      // ✅ Usar RAF para agrupar leitura e escrita de layout
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const chatContainer = document.querySelector('.chat-container');
          if (chatContainer) {
            // Agrupar leitura e escrita
            const scrollHeight = chatContainer.scrollHeight;
            chatContainer.scrollTop = scrollHeight;
          }
        });
      });
    }
  }, [audioBlob]);

  // Formatar nome do usuário
  const getUserDisplayName = (participant?: ConversationParticipant, message?: Message) => {
    // Se é mensagem do tipo 'system', sempre mostrar como "Suporte Veredicta"
    if (message && message.message_type === 'system') {
      return 'Suporte Veredicta';
    }
    
    // Se é mensagem do usuário atual, mostrar o nome do usuário
    if (message && user?.uid && message.sender_id === user.uid) {
      return user.profile?.full_name || user.email?.split('@')[0] || 'Você';
    }
    
    // Se é mensagem em conversa de suporte e não é do usuário atual
    if (message && currentConversation?.type === 'support' && message.sender_id !== user?.uid) {
      const senderParticipant = participants.find(p => p.user_id === message.sender_id);
      const userRole = user?.role || 'client';
      
      // Se o usuário atual é cliente/redator, o sender é sempre suporte/admin
      if (userRole !== 'admin') {
        // Para cliente/redator, qualquer mensagem que não é dele é do suporte
        return 'Suporte Veredicta';
      }
      
      // Se o usuário atual é admin, verificar se o sender é suporte/admin ou cliente/redator
      if (userRole === 'admin') {
        // Se o sender é suporte/admin, mostrar "Suporte Veredicta"
        if (senderParticipant && (senderParticipant.role === 'support' || senderParticipant.role === 'admin' || senderParticipant.user_id === 'support-admin')) {
          return 'Suporte Veredicta';
        }
        
        // Se não é suporte, buscar o nome do participante (cliente/redator) diretamente
        if (senderParticipant) {
          // PRIORIDADE 1: Buscar do metadata do participante
          const metadata = (senderParticipant as any).metadata || {};
          if (metadata.full_name) return metadata.full_name;
          if (metadata.name) return metadata.name;
          
          // PRIORIDADE 2: Buscar do user object
          const possibleNames = [
            senderParticipant.user?.name,
            (senderParticipant.user as any)?.full_name,
            (senderParticipant as any).display_name,
            (senderParticipant as any).user_name,
            (senderParticipant.user as any)?.email ? (senderParticipant.user as any).email.split('@')[0] : null,
          ].filter(Boolean) as string[];
          
          if (possibleNames.length > 0) {
            return possibleNames[0];
          }
        }
        
        // Fallback: tentar metadata da conversa
        const metadataName = getMetadataDisplayName();
        if (metadataName && metadataName !== 'Usuário' && metadataName !== 'Suporte Veredicta') {
          return metadataName;
        }
      }
    }
    
    // Para conversas de petição, usar o título da conversa (que é o nome do cliente)
    if (!participant && currentConversation?.type === 'petition') {
      return currentConversation.title;
    }
    
    // Para outros participantes
    if (!participant) {
      // Tentar usar metadata da conversa para obter o nome
      const metadataName = getMetadataDisplayName();
      if (metadataName) {
        return metadataName;
      }
      // Tentar usar o título da conversa
      if (currentConversation?.title) {
        return currentConversation.title;
      }
      return 'Usuário';
    }
    
    // PRIORIDADE 1: Buscar nome completo do participante
    // Primeiro verificar metadata do participante (mais confiável)
    const metadata = (participant as any).metadata || {};
    if (metadata.full_name) return metadata.full_name;
    if (metadata.name) return metadata.name;
    
    // PRIORIDADE 2: Buscar do user object
    const possibleNames = [
      participant.user?.name, // PRIMEIRO: nome do ChatService
      (participant.user as any)?.full_name, // Segundo: full_name direto
      (participant as any).display_name,
      (participant as any).user_name,
      (participant.user as any)?.email ? (participant.user as any).email.split('@')[0] : null,
    ].filter(Boolean) as string[];
    
    if (possibleNames.length > 0) {
      return possibleNames[0];
    }
    
    // PRIORIDADE 2: Se é conversa de petição e participante é cliente, usar o título
    if (currentConversation?.type === 'petition' && participant.role === 'client') {
      return currentConversation.title; // Nome do cliente
    }
    
    // PRIORIDADE 3: Tentar metadata da conversa
    const conversationMetadataName = getMetadataDisplayName();
    if (conversationMetadataName) {
      return conversationMetadataName;
    }
    
    // PRIORIDADE 4: Tentar título da conversa
    if (currentConversation?.title && currentConversation.title !== 'Conversa') {
      return currentConversation.title;
    }
    
    // PRIORIDADE 5: Fallbacks
    if (participant.user && participant.user.id) {
      return `Usuário ${participant.user.id.slice(0, 8)}`;
    }
    return `Usuário ${participant.user_id.slice(0, 8)}`;
  };

  // URL fixa para avatar do admin/suporte
  const getAdminAvatarUrl = () => {
    return '/veredicta-logo.png';
  };

  // Verificar se é admin/suporte
  const isAdminOrSupport = (participant?: ConversationParticipant, message?: Message) => {
    // Se temos um participant, verificar diretamente
    if (participant) {
      return participant.role === 'admin' || participant.role === 'support' || participant.user_id === 'support-admin';
    }
    
    // Se temos uma mensagem e é conversa de suporte, verificar o sender
    if (message && currentConversation?.type === 'support' && message.sender_id !== user?.uid) {
      const senderParticipant = participants.find(p => p.user_id === message.sender_id);
      if (senderParticipant) {
        return senderParticipant.role === 'admin' || senderParticipant.role === 'support' || senderParticipant.user_id === 'support-admin';
      }
      // Se não encontrou o participant mas é conversa de suporte e não é do usuário atual, assumir que é suporte
      const userRole = user?.role || 'client';
      if (userRole !== 'admin') {
        // Cliente/redator visualizando: qualquer mensagem que não é dele é do suporte
        return true;
      }
    }
    
    return false;
  };

  // Formatar avatar do usuário
  const getUserAvatar = (participant?: ConversationParticipant, message?: Message) => {
    // Se é mensagem do usuário atual, usar foto do perfil se disponível
    if (message && user?.uid && message.sender_id === user.uid) {
      return (user.profile as any)?.avatar_url || undefined;
    }
    
    // Se é mensagem do suporte/admin, usar logo fixo
    if (isAdminOrSupport(participant, message)) {
      return getAdminAvatarUrl();
    }
    
    // Para outros participantes
    if (!participant) return undefined;
    
    // Buscar avatar do participante: primeiro do user.avatar_url, depois do metadata
    if (participant.user) {
      // Tentar múltiplas propriedades do user object
      const userAvatar = (participant.user as any).avatar_url || 
                        (participant.user as any).avatar ||
                        undefined;
      if (userAvatar) {
        return userAvatar;
      }
    }
    
    // Tentar buscar do metadata do participante
    const metadata = (participant as any).metadata || {};
    if (metadata.avatar_url || metadata.partnerAvatar || metadata.partner_avatar) {
      return metadata.avatar_url || metadata.partnerAvatar || metadata.partner_avatar;
    }
    
    return undefined;
  };

  // Obter iniciais do nome
  const getUserInitials = (participant?: ConversationParticipant, message?: Message) => {
    // Se é mensagem do usuário atual
    if (message && user?.uid && message.sender_id === user.uid) {
      const userName = user.profile?.full_name || user.email?.split('@')[0] || 'Você';
      const initials = userName.split(' ').map(n => n[0]).filter(n => n).join('').toUpperCase().slice(0, 2);
      return initials || 'V'; // Fallback para "Você"
    }
    
    // Se é mensagem do suporte
    if (message && currentConversation?.type === 'support' && message.sender_id !== user?.uid) {
      const senderParticipant = participants.find(p => p.user_id === message.sender_id);
      // Se o remetente é admin/suporte, usar logo fixo, senão usar iniciais
      if (senderParticipant && isAdminOrSupport(senderParticipant, message)) {
        return 'SV'; // "Suporte Veredicta"
      }
    }
    
    // Para conversas de petição sem participant, usar o título (nome do cliente)
    if (!participant && currentConversation?.type === 'petition') {
      const name = currentConversation.title;
      const initials = name.split(' ').map(n => n[0]).filter(n => n).join('').toUpperCase().slice(0, 2);
      return initials || 'CL'; // Fallback para "Cliente"
    }
    
    // Para outros participantes
    if (!participant) {
      // Tentar buscar do metadata da conversa
      const metadata = currentConversation?.metadata as any;
      if (metadata?.initials || metadata?.partnerInitials || metadata?.partner_initials) {
        return metadata.initials || metadata.partnerInitials || metadata.partner_initials;
      }
      return '??';
    }
    
    // Buscar nome do participante: primeiro do user, depois do metadata
    const metadata = (participant as any).metadata || {};
    let name = getUserDisplayName(participant, message);
    
    // Se não encontrou nome, tentar do metadata
    if (!name || name === participant.user_id) {
      name = metadata.full_name || metadata.name || metadata.partnerName || metadata.partner_name || '';
    }
    
    // Se ainda não encontrou, tentar do user
    if (!name && participant.user) {
      name = (participant.user as any)?.full_name || 
             (participant.user as any)?.name || 
             (participant.user as any)?.email?.split('@')[0] || 
             '';
    }
    
    // Gerar iniciais
    if (name) {
      const initials = name.split(' ').map(n => n[0]).filter(n => n).join('').toUpperCase().slice(0, 2);
      if (initials && initials.length > 0) {
        return initials;
      }
    }
    
    // Fallback: usar iniciais do metadata ou do user_id
    if (metadata.initials || metadata.partnerInitials || metadata.partner_initials) {
      return metadata.initials || metadata.partnerInitials || metadata.partner_initials;
    }
    
    return participant.user_id.slice(0, 2).toUpperCase();
  };

  // Traduzir status da conversa
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'closed': 'Fechado',
      'archived': 'Arquivado'
    };
    return statusMap[status] || status;
  };

  // Traduzir tipo da conversa (com display_id para petições)
  const getTypeLabel = () => {
    if (!currentConversation) return '';
    
    if (currentConversation.type === 'petition') {
      const metadata = (currentConversation as any).metadata || {};
      const convAny = currentConversation as any;
      
      // Tentar todos os possíveis caminhos para o display_id
      const displayId =
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
      
      // Sempre mostrar o número, mesmo que seja o petition_id
      if (displayId) {
        return `Petição #${displayId}`;
      }
      
      return 'Petição';
    }
    
    const typeMap: Record<string, string> = {
      'support': 'Suporte',
      'general': 'Geral'
    };
    return typeMap[currentConversation.type] || currentConversation.type;
  };

  // Traduzir prioridade da conversa
  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Baixa',
      'normal': 'Normal',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityMap[priority] || priority;
  };

  // Obter número de protocolo para conversas de suporte
  const getProtocolNumber = (): string | null => {
    if (!currentConversation || currentConversation.type !== 'support') {
      return null;
    }
    
    const metadata = (currentConversation as any).metadata || {};
    return metadata.protocol_number || null;
  };

  // Função para obter o avatar do destinatário no header
  // ✅ CORREÇÃO: Usar useMemo para evitar re-renderização desnecessária e garantir sincronização
  const headerAvatar = useMemo(() => {
    // ✅ CORREÇÃO CRÍTICA: Verificar PRIMEIRO se conversationId corresponde ao currentConversation.id
    // Isso deve ser a primeira verificação para evitar mostrar avatar da conversa anterior
    // Se conversationId existe mas currentConversation não corresponde, ocultar imediatamente
    if (conversationId) {
      if (!currentConversation || currentConversation.id !== conversationId) {
        return null; // Avatar não sincronizado - ocultar imediatamente
      }
    }
    
    if (!currentConversation) return null;
    
    const userRole = user?.role || 'client';
    
    // Para conversas de suporte, se é cliente/redator visualizando, mostrar logo fixo do suporte
    if (currentConversation.type === 'support' && userRole !== 'admin') {
      const adminAvatarUrl = getAdminAvatarUrl();
      return (
        <Avatar className="h-10 w-10 flex-shrink-0" key={`avatar-support-${currentConversation.id}`}>
          <AvatarImage 
            src={adminAvatarUrl} 
            alt="Suporte Veredicta" 
            className="object-cover"
            onError={(e) => {
              // Se a imagem não carregar, mostrar fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <AvatarFallback className="text-sm bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 font-semibold">
            🛠️
          </AvatarFallback>
        </Avatar>
      );
    }
    
    // Para todas as conversas (incluindo suporte quando admin visualiza), encontrar o destinatário (não o usuário atual)
    const otherParticipant = getOtherParticipant();
    const { avatarUrl: metadataAvatarUrl, initials: metadataInitials } = getMetadataAvatar();
    const fallbackInitials = getUserInitials(otherParticipant ?? undefined) || metadataInitials || getUserInitials();

    // Se é conversa de suporte e não há outro participante, usar avatar padrão
    if (currentConversation.type === 'support' && !otherParticipant && !metadataAvatarUrl) {
      return (
        <Avatar className="h-10 w-10" key={`avatar-support-fallback-${currentConversation.id}`}>
          <AvatarImage src={undefined} />
          <AvatarFallback className="text-sm bg-blue-100 text-blue-700">
            {fallbackInitials || 'C'}
          </AvatarFallback>
        </Avatar>
      );
    }

    if (!otherParticipant && !metadataAvatarUrl) {
      // Se não há participantes carregados, usar o título (nome do cliente)
      return (
        <Avatar className="h-10 w-10" key={`avatar-fallback-${currentConversation.id}`}>
          <AvatarImage src={undefined} />
          <AvatarFallback className="text-sm bg-blue-100 text-blue-700">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
      );
    }

    // Se o outro participante é admin/suporte, usar logo fixo
    const isOtherParticipantAdmin = otherParticipant && isAdminOrSupport(otherParticipant);
    
    // Buscar avatar: primeiro do participante, depois do metadata
    let avatarUrl = isOtherParticipantAdmin 
      ? getAdminAvatarUrl() 
      : (otherParticipant ? getUserAvatar(otherParticipant) : metadataAvatarUrl);
    
    // Se não encontrou avatar do participante, tentar do metadata
    if (!avatarUrl && otherParticipant) {
      const participantMetadata = (otherParticipant as any).metadata || {};
      avatarUrl = participantMetadata.avatar_url || 
                  participantMetadata.partnerAvatar || 
                  participantMetadata.partner_avatar || 
                  undefined;
    }
    
    // Se ainda não encontrou, tentar buscar diretamente do user object do participante
    if (!avatarUrl && otherParticipant?.user) {
      avatarUrl = (otherParticipant.user as any)?.avatar_url || 
                  (otherParticipant.user as any)?.avatar || 
                  undefined;
    }
    
    // Se ainda não encontrou e há outro participante, tentar buscar do perfil do usuário via Supabase
    // (isso será feito de forma assíncrona se necessário, mas por enquanto usar o que temos)
    
    // Buscar iniciais: primeiro do participante, depois do metadata
    let initials = otherParticipant ? getUserInitials(otherParticipant) : (metadataInitials || fallbackInitials);
    
    // Se não encontrou iniciais válidas, tentar gerar do nome
    if (!initials || initials === '??') {
      if (otherParticipant) {
        const name = getUserDisplayName(otherParticipant);
        if (name && name !== otherParticipant.user_id) {
          initials = name.split(' ').map(n => n[0]).filter(n => n).join('').toUpperCase().slice(0, 2);
        }
      }
      if (!initials || initials.length === 0) {
        initials = metadataInitials || fallbackInitials || '??';
      }
    }
    
    return (
      <Avatar 
        className="h-10 w-10 flex-shrink-0" 
        key={`avatar-${conversationId || currentConversation.id}`}
      >
        {avatarUrl && (
          <AvatarImage 
            src={avatarUrl} 
            className="object-cover" 
            alt={otherParticipant ? getUserDisplayName(otherParticipant) : 'Avatar'}
            onError={(e) => {
              // Se a imagem não carregar, mostrar fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <AvatarFallback className="text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
          {initials || '??'}
        </AvatarFallback>
      </Avatar>
    );
  }, [conversationId, currentConversation, user?.role, participants]);

  // ✅ CORREÇÃO: Verificar se há dessincronização entre conversationId e currentConversation
  const isConversationSynced = !conversationId || !currentConversation || currentConversation.id === conversationId;
  
  if (!currentConversation || !isConversationSynced) {
    // Se está em transição, mostrar loading ao invés de mensagem de "selecione conversa"
    if (conversationId && !currentConversation) {
      return (
        <Card className="bg-container-primary border-border w-full h-[600px] flex items-center justify-center">
          <CardContent className="bg-container-inner rounded-lg">
            <p className="text-muted-foreground text-center">
              Carregando conversa...
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="bg-container-primary border-border w-full h-[600px] flex items-center justify-center">
        <CardContent className="bg-container-inner rounded-lg">
          <p className="text-muted-foreground text-center">
            Selecione uma conversa para começar a conversar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-container-primary border-border w-full h-full max-h-full flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar do destinatário */}
            {headerAvatar || (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  ??
                </AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <CardTitle className="text-lg">{getConversationDisplayName()}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={currentConversation.status === 'active' ? 'default' : 'secondary'}>
                  {getStatusLabel(currentConversation.status)}
                </Badge>
                <Badge variant="outline">
                  {getTypeLabel()}
                </Badge>
                {/* 🚀 Badge de Protocolo para conversas de suporte */}
                {currentConversation.type === 'support' && getProtocolNumber() && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-mono">
                    {getProtocolNumber()}
                  </Badge>
                )}
                {currentConversation.priority !== 'normal' && (
                  <Badge variant={currentConversation.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {getPriorityLabel(currentConversation.priority)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={forceReloadMessages} 
            title="Recarregar mensagens"
            className="hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleParticipants}
            title="Ver participantes"
              className={`hover:bg-muted ${showParticipants ? 'bg-muted' : ''}`}
          >
            <Users className="h-4 w-4" />
          </Button>
          
          <div className="relative menu-container">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleMenu}
              title="Mais opções"
              className="hover:bg-muted"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 bg-background border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                <button
                  onClick={archiveConversation}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  disabled={currentConversation?.status === 'archived' && (currentConversation as any).metadata?.system_archived === true}
                >
                  <Archive className="h-4 w-4" />
                  {currentConversation?.status === 'archived' ? 'Desarquivar conversa' : 'Arquivar conversa'}
                </button>
                {currentConversation?.status !== 'closed' && (
                  <button
                    onClick={closeConversation}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
                  >
                    <X className="h-4 w-4" />
                    Fechar conversa
                  </button>
                )}
              </div>
            )}
          </div>
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              title="Fechar chat"
              className="hover:bg-muted"
            >
              ✕
            </Button>
          )}
        </div>
        </div>
      </CardHeader>

      <Separator />

      {/* 🚫 Banner de Conversa Arquivada */}
      {currentConversation?.status === 'archived' && (
        <div className="bg-orange-100 dark:bg-orange-900/30 border-b border-orange-300 dark:border-orange-700 p-3">
          <div className="flex items-center justify-center gap-2 text-orange-800 dark:text-orange-200">
            <Archive className="h-5 w-5" />
            <span className="text-sm font-medium">
              {currentConversation?.metadata?.system_archived 
                ? '📋 Esta conversa foi arquivada automaticamente após a aprovação da petição. Não é possível enviar novas mensagens.'
                : '📋 Esta conversa está arquivada. Não é possível enviar novas mensagens.'}
            </span>
          </div>
        </div>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <div className="border-b border-border p-4 bg-muted">
          <h3 className="text-sm font-medium text-foreground mb-3">Participantes da Conversa</h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserAvatar(participant)} className="object-cover" />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(participant)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getUserDisplayName(participant)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {participant.role}
                  </p>
                </div>
                {participant.user_id === user?.uid && (
                  <Badge variant="secondary" className="text-xs">
                    Você
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <CardContent className="bg-container-inner rounded-b-lg flex-1 p-0 min-h-0 overflow-hidden chat-container flex flex-col relative">
        {/* Overlay de drag and drop */}
        {isDragOver && (
          <div
            className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/30 border-4 border-dashed border-blue-500 dark:border-blue-400 z-50 flex items-center justify-center backdrop-blur-sm"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="bg-background dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center border border-border">
              <Paperclip className="h-12 w-12 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
              <p className="text-xl font-semibold mb-2">Solte o arquivo aqui</p>
              <p className="text-sm text-muted-foreground">
                Arraste e solte uma imagem ou arquivo para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Tamanho máximo: 10MB
              </p>
            </div>
          </div>
        )}
        
        <div
          ref={scrollContainerRef}
          className="flex-1 p-2 chatContainer overflow-y-auto overflow-x-hidden min-h-0"
          onScroll={handleScroll}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4 w-full max-w-full overflow-hidden messageContainer chat-messages-container">
            {isLoadingOlderMessages && messages.length > 0 && (
              <div className="flex justify-center py-2">
                <span className="text-xs text-muted-foreground">
                  Carregando mensagens anteriores...
                </span>
              </div>
            )}
            {messages.map((message) => {
              const sender = participants.find(p => p.user_id === message.sender_id);
              // Lógica mais robusta para determinar se é mensagem própria
              // Mensagens do tipo 'system' nunca são próprias (são do sistema/admin)
              const isOwnMessage = message.message_type !== 'system' && user?.uid && message.sender_id === user.uid;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} w-full px-2`}
                >
                  <div className={`flex max-w-[85%] min-w-0 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                    {!isOwnMessage && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={getUserAvatar(sender, message)} className="object-cover" />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {getUserInitials(sender, message)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {getUserDisplayName(sender, message)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {formatDistanceToNow(new Date(message.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                            {message.status === 'sending' && (
                              <span className="text-blue-500">⏳</span>
                            )}
                            {message.status === 'sent' && (
                              <span className="text-green-500">✓</span>
                            )}
                            {message.status === 'delivered' && (
                              <span className="text-green-500">✓✓</span>
                            )}
                            {message.status === 'read' && (
                              <span className="text-blue-500">✓✓</span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`px-3 py-2 rounded-lg w-full max-w-none messageBubble chat-message-bubble ${
                          isOwnMessage 
                            ? 'bg-orange-500 text-white'
                            : 'bg-orange-50 dark:bg-orange-900/20 text-gray-900 dark:text-orange-50 border border-orange-200 dark:border-orange-800'
                        }`}
                        style={{ 
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {message.content && !message.file_url && (
                          <p 
                            className="text-sm messageText chat-message-text"
                            style={{ 
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            {message.content}
                          </p>
                        )}
                        
                        {message.content && message.file_url && !message.content.startsWith('📎') && (
                          <p 
                            className="text-sm messageText chat-message-text"
                            style={{ 
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            {message.content}
                          </p>
                        )}
                        
                        {message.file_url && (
                          <div className="mt-2">
                            {(() => {
                              // Função para detectar se é áudio
                              const isAudioFile = (fileName?: string, messageType?: string, fileUrl?: string) => {
                                // Se o messageType é 'audio', é definitivamente áudio
                                if (messageType === 'audio') {
                                  return true;
                                }
                                
                                // Se não há fileName, verificar pela URL
                                if (!fileName) {
                                  if (fileUrl && fileUrl.includes('data:audio/')) {
                                    return true;
                                  }
                                  return false;
                                }
                                
                                const audioExtensions = ['webm', 'm4a', 'mp3', 'ogg', 'wav', 'audio', 'opus', 'aac', 'flac'];
                                const lowerFileName = fileName.toLowerCase();
                                
                                // Verifica se contém extensão de áudio
                                const hasAudioExt = audioExtensions.some(ext => lowerFileName.includes(ext));
                                
                                // Verifica se é um arquivo de áudio comum (com extensão)
                                const hasAudioExtPattern = /\.(webm|m4a|mp3|ogg|wav|opus|aac|flac)$/i.test(fileName);
                                
                                // Verifica se o nome contém "audio" ou "gravacao"
                                const hasAudioName = lowerFileName.includes('audio') || 
                                                   lowerFileName.includes('gravacao') || 
                                                   lowerFileName.includes('gravação') ||
                                                   lowerFileName.includes('voice') ||
                                                   lowerFileName.includes('voz');
                                
                                const result = hasAudioExt || hasAudioExtPattern || hasAudioName;
                                // console.log('🔍 Audio detection details:', {
                                //   fileName,
                                //   messageType,
                                //   fileUrl: fileUrl?.substring(0, 50) + '...',
                                //   lowerFileName,
                                //   hasAudioExt,
                                //   hasAudioExtPattern,
                                //   hasAudioName,
                                //   result
                                // });
                                
                                return result;
                              };

                              const isAudio = isAudioFile(message.file_name, message.message_type, message.file_url);
                              
                              // Determinar se é imagem
                              const isImage = message.file_url && (
                                message.file_url.startsWith('data:image/') || 
                                (message.file_name && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_name))
                              );
                              
                              if (isAudio) {
                                return (
                                  <AudioPlayer 
                                    audioUrl={message.file_url} 
                                    fileName={message.file_name}
                                    fileSize={message.file_size}
                                    isOwnMessage={isOwnMessage}
                                  />
                                );
                              }
                              
                              if (isImage) {
                                return (
                                <div className="mt-3">
                                  <div className="relative group">
                                    <div 
                                      className="cursor-pointer" 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openImageModal(message.file_url, message.file_name);
                                      }}
                                    >
                                      <img 
                                        src={message.file_url} 
                                        alt={message.file_name || 'Imagem'}
                                        className="max-w-full h-auto rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 pointer-events-none"
                                        style={{ maxHeight: '300px' }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200 flex items-center justify-center pointer-events-none">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <Eye className="h-6 w-6 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Botão de download para imagens */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadFile(message.file_url, message.file_name || 'imagem.jpg');
                                      }}
                                      className={`absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                                        isOwnMessage ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-600'
                                      }`}
                                      title="Baixar imagem"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className={`text-xs font-medium ${
                                      isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                                    }`}>
                                      {message.file_name}
                                    </p>
                                    {message.file_size && (
                                      <p className={`text-xs ${
                                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                      }`}>
                                        {Math.round(message.file_size / 1024)} KB
                                      </p>
                                    )}
                                  </div>
                                </div>
                                );
                              }
                              
                              // Layout padrão para outros arquivos (PDFs, documentos, etc.)
                              return (
                                <div className="mt-3">
                                  <div className={`inline-flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                                    isOwnMessage 
                                      ? 'bg-white bg-opacity-20 border-white border-opacity-30 hover:bg-opacity-30' 
                                      : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700/50 shadow-sm'
                                  }`}>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                      isOwnMessage 
                                        ? 'bg-white bg-opacity-20' 
                                        : 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40'
                                    } ${getFileIconColor(message.file_name || '', message.file_url)}`}>
                                      {getFileIcon(message.file_name || '', message.file_url)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${
                                        isOwnMessage 
                                          ? 'text-white' 
                                          : 'text-indigo-900 dark:text-indigo-100'
                                      }`}>
                                        {message.file_name}
                                      </p>
                                      {message.file_size && (
                                        <p className={`text-xs ${
                                          isOwnMessage 
                                            ? 'text-blue-100' 
                                            : 'text-indigo-600 dark:text-indigo-400'
                                        }`}>
                                          {Math.round(message.file_size / 1024)} KB
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          downloadFile(message.file_url, message.file_name || 'arquivo');
                                        }}
                                        className={`p-2 rounded-full transition-colors duration-200 ${
                                          isOwnMessage 
                                            ? 'text-white hover:bg-white hover:bg-opacity-20' 
                                            : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                                        }`}
                                        title="Baixar arquivo"
                                      >
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      
                      {isOwnMessage && (
                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                          {message.status === 'sending' && (
                            <span className="text-blue-500">⏳</span>
                          )}
                          {message.status === 'sent' && (
                            <span className="text-green-500">✓</span>
                          )}
                          {message.status === 'delivered' && (
                            <span className="text-green-500">✓✓</span>
                          )}
                          {message.status === 'read' && (
                            <span className="text-blue-500">✓✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </CardContent>

      <Separator />

      {/* Input */}
      <div className="p-4 bg-background border-t border-border">
        {/* Controles de Áudio */}
        {audioBlob && (
          <div className="mb-3 p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">🎵 Áudio gravado</p>
                <p className="text-xs text-gray-500">
                  {formatRecordingTime(recordingTime)} • {Math.round(audioBlob.size / 1024)} KB
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={cancelRecording}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                ✕
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={sendAudio} 
                disabled={isLoading}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview do arquivo selecionado */}
        {selectedFile && (
          <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-white border-2 border-blue-200 flex items-center justify-center ${getFileIconColor(selectedFile.name, selectedFile.type)}`}>
                {getFileIcon(selectedFile.name, selectedFile.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round(selectedFile.size / 1024)} KB • {selectedFile.type.split('/')[1]?.toUpperCase() || 'ARQUIVO'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={cancelFileSelection}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-8 h-8 p-0"
                >
                  ✕
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={sendFile} 
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full w-8 h-8 p-0"
                >
                  {isUploading ? '...' : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              disabled={currentConversation?.status === 'archived'}
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
            >
              <label htmlFor="file-upload" className={`flex items-center justify-center w-10 h-10 rounded-full ${currentConversation?.status === 'archived' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <Paperclip className="h-4 w-4" />
              </label>
            </Button>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={currentConversation?.status === 'archived'}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />
          </div>
          
          <Input
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentConversation?.status === 'archived' ? "Conversa arquivada - não é possível enviar mensagens" : "Digite sua mensagem..."}
            disabled={isLoading || isRecording || currentConversation?.status === 'archived'}
            className="flex-1"
          />
          
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              disabled={isLoading || currentConversation?.status === 'archived'}
              size="sm"
              variant="ghost"
            >
              <Mic className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={stopRecording}
              size="sm"
              variant="destructive"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isLoading || isRecording || currentConversation?.status === 'archived'}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Gravando... {formatRecordingTime(recordingTime)}</span>
          </div>
        )}
        
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
      
      {/* Modal de visualização de imagem */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={closeImageModal}
        imageUrl={selectedImageUrl}
        fileName={selectedImageName}
        onDownload={() => {
          if (selectedImageUrl) {
            downloadFile(selectedImageUrl, selectedImageName || 'imagem.jpg');
          }
        }}
      />
    </Card>
  );
}
