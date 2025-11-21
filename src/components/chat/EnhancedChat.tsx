// src/components/chat/EnhancedChat.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ChatInput from './ChatInput';
import ChatMessage, { UIChatMessage } from './ChatMessage';
import ChatHeader from './ChatHeader';
import { useSupabaseConversation } from '@/hooks/useSupabaseConversation';
import { markConversationAsRead } from '@/lib/chatService';
import { messageEncryption, type EncryptedMessage } from '@/services/MessageEncryption';
import { supabase } from '@/lib/supabaseClient'
import { useNotifications } from '@/contexts/NotificationContext';
import { sendMessageWithFiles } from '@/lib/chatUploads';

// --- Helpers p/ anexos --- //

function sanitizeSegment(seg: string) {
  const noAccents = (seg || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let s = noAccents.replace(/[^a-zA-Z0-9._-]/g, '-');
  s = s.replace(/[\/\\?%*:|"<>]/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  return s.slice(0, 80) || 'folder';
}

function sanitizeFileName(name: string) {
  const noAccents = (name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let s = noAccents.replace(/[^a-zA-Z0-9._-]/g, '-');
  s = s.replace(/[\/\\?%*:|"<>]/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  if (!/\.[a-zA-Z0-9]{1,8}$/.test(s)) s = s + '.dat';
  return s.slice(-120);
}

function safeParseArray(maybeJson: any): any[] {
  try {
    if (Array.isArray(maybeJson)) return maybeJson;
    if (typeof maybeJson === 'string') {
      const j = JSON.parse(maybeJson);
      return Array.isArray(j) ? j : [];
    }
    return [];
  } catch {
    return [];
  }
}

// helper: deduz o MIME a partir da extensão
function extToMime(name = '') {
  const n = name.toLowerCase();
  if (n.endsWith('.webm')) return 'video/webm';  // MediaRecorder costuma gerar .webm
  if (n.endsWith('.m4a'))  return 'audio/mp4';
  if (n.endsWith('.mp3'))  return 'audio/mpeg';
  if (n.endsWith('.ogg'))  return 'audio/ogg';
  if (n.endsWith('.wav'))  return 'audio/wav';
  return 'application/octet-stream';
}

// ==== PATCH A: helpers de scroll ====
const SCROLL_EPS = 48; // tolerância (px) pro "estou no fim?"

function isNearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_EPS;
}

type EnhancedChatProps = {
  conversationId: string;
  userId: string;
  userName: string;
  userType: 'writer' | 'client' | 'admin';
  onClose: () => void;
  conversationName?: string;
  conversationAvatar?: string;
  conversationStatus?: string;
  conversationType?: string;
  petitionId?: string;
  files?: { name: string; url: string }[];
};

type TypingUser = { id: string; name: string };

const EnhancedChat: React.FC<EnhancedChatProps> = ({
  conversationId,
  userId,
  userName,
  userType,
  onClose,
  conversationName,
  conversationAvatar,
  conversationStatus,
  conversationType,
  petitionId,
  files = [],
}) => {
    console.log('[DEBUG] Nome da conversa:', conversationName);
  const { toast } = useToast();
  const { push: addNotification } = useNotifications();

  // refs do scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dingRef = useRef<HTMLAudioElement | null>(null);
const prevCountRef = useRef<number>(0);

// ==== PATCH B: estado "estou no fim?"
const atBottomRef = useRef(true);
const justOpenedRef = useRef(true);

// (opcional) desbloquear autoplay após a 1ª interação
useEffect(() => {
  const unlock = () => dingRef.current?.play().catch(() => {/* ignore */});
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  return () => {
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
  };
}, []);

  // mensagens
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { messages, isLoading, sendMessage } = useSupabaseConversation(conversationId);
  const updatesRef = useRef<Record<string, any>>({});
const [updateTick, setUpdateTick] = useState(0);

  // criptografia (idempotente)
  useEffect(() => {
    messageEncryption.initialize().catch(() => {});
  }, []);

  // ==== PATCH C: ao abrir/trocar conversa, rola pro fim uma vez
useEffect(() => {
  const t = setTimeout(() => {
    scrollToBottom(false);     // sem animação, pra já posicionar
    justOpenedRef.current = false;
  }, 0);
  return () => clearTimeout(t);
}, [conversationId]);

  // util: rolar até o fim (duas estratégias)
  const scrollToBottom = (smooth = true) => {
    // 1) âncora no final (típico de chat)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
    // 2) scrollTop no container (fallback)
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

useEffect(() => {
  const prev = prevCountRef.current;
  const curr = messages.length;
  const el = scrollContainerRef.current;

  const haveNew = curr > prev;
  const last: any = curr ? messages[curr - 1] : null;
  const isFromOther = last && last.sender_id !== userId;

  // 🔔 som + badge quando chegam mensagens de outros
  if (haveNew && isFromOther) {
    try {
      if (dingRef.current) {
        dingRef.current.currentTime = 0;
        void dingRef.current.play();
      }
    } catch {}

    // notificação
    const attachments =
      Array.isArray(last.attachments)
        ? last.attachments
        : (typeof last.attachments === 'string' && last.attachments.trim().startsWith('[')
            ? JSON.parse(last.attachments)
            : []);

    const senderName = last.sender_name ?? last.senderName ?? 'Contato';
    const preview =
      (typeof last.content === 'string' && last.content.trim()) ||
      (attachments.length > 0 ? `📎 ${attachments.length} arquivo(s)` : 'Nova mensagem');

    addNotification({
      id: `chat:${last.id}`,
      type: 'chat',
      title: 'Nova mensagem',
      description: `${senderName}: ${preview}`,
      href: '/writer/chat',
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  // 👇 lógica de scroll
  const shouldForceToBottom =
    // se a última é minha, posso puxar pro fim
    (haveNew && last && last.sender_id === userId) ||
    // ao abrir conversa pela 1ª vez
    justOpenedRef.current ||
    // se o usuário está perto do fim, acompanhamos
    (el ? isNearBottom(el) : true);

  if (shouldForceToBottom) {
    const raf = requestAnimationFrame(() => scrollToBottom(true));
    const t = setTimeout(() => scrollToBottom(false), 60);
    // marcar como lida (só se estamos no fim ou quase)
    const r = setTimeout(() => {
      if (messages.length) markConversationAsRead(conversationId, userId);
    }, 150);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      clearTimeout(r);
    };
  }

  // atualiza o contador ao final
  prevCountRef.current = curr;
}, [messages, conversationId, userId, addNotification]);

  // ---- DIGITANDO (inline) ----
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { broadcast: { self: true } },
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const u = payload as TypingUser;
        if (!u || u.id === userId) return;

        setTypingUsers(prev => {
          const next = [...prev.filter(p => p.id !== u.id), u];
          clearTimeout(timeoutsRef.current[u.id]);
          timeoutsRef.current[u.id] = setTimeout(() => {
            setTypingUsers(p => p.filter(x => x.id !== u.id));
          }, 3000);
          return next;
        });
      })
      .subscribe();

    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  const startTyping = () => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { id: userId, name: userName } as TypingUser,
    });
  };

  // ==== PATCH D: atualiza o "estou no fim?" quando o usuário rolar
const handleScrollContainer = () => {
  const el = scrollContainerRef.current;
  if (!el) return;
  atBottomRef.current = isNearBottom(el);
};

  useEffect(() => {
  const ch = supabase
    .channel(`chat-upd:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'app_d379dcb283_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // guarda a versão mais nova desta mensagem
        updatesRef.current[payload.new.id] = payload.new;
        // força re-render do mapeamento
        setUpdateTick((t) => t + 1);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(ch);
  };
}, [conversationId]);
  // ----------------------------

  const handleChange = (val: string) => {
    setMessageText(val);
    startTyping();
  };

const handleSend = async () => {
  // nada pra enviar? sai
  if (!messageText.trim() && selectedFiles.length === 0) return;

  try {
    console.log('✉️ Enviando mensagem:', messageText, selectedFiles);

    // ✅ use a assinatura correta do hook: (text, files)
    await sendMessage(messageText, selectedFiles);

    console.log('✅ Mensagem enviada com sucesso');

    setMessageText('');
    setSelectedFiles([]);
    setTimeout(() => scrollToBottom(true), 0);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err);
    toast({
      title: 'Erro ao enviar mensagem',
      description: 'Não foi possível enviar. Tente novamente.',
      variant: 'destructive',
    });
  }
};

  // descriptografia (se vier com prefixo)
  const tryDecrypt = async (raw: string) => {
    const isEnc =
      typeof raw === 'string' &&
      (raw.startsWith('encrypted:') || raw.startsWith('criptografado:'));
    if (!isEnc) return raw;
    try {
      const json = raw.replace(/^encrypted:|^criptografado:/, '');
      const data = JSON.parse(json) as EncryptedMessage;
      const plain = await messageEncryption.decryptMessage(data);
      return plain || raw;
    } catch {
      return raw;
    }
  };

  // mapear mensagens do banco → UI
  const [formattedAllMessages, setFormattedAllMessages] = useState<UIChatMessage[]>([]);
useEffect(() => {
  (async () => {
    const mapped = await Promise.all(
      messages.map(async (original: any) => {
          const msg = updatesRef.current[original.id] ?? original;
// 🔽🔽🔽 SUBSTITUA seu bloco de normalização por este
const candidates: any[] = [
  msg.attachments,
  msg.files,
  msg.attachments_json,
  msg.metadata?.attachments,
  msg.metadata?.files,
  (typeof msg.extra === 'string' ? (() => { try {
    const j = JSON.parse(msg.extra); return j?.attachments;
  } catch { return undefined; }})() : undefined),
];

// pega o primeiro candidato válido
let rawList: any[] = [];
for (const c of candidates) {
  try {
    if (Array.isArray(c)) { rawList = c; break; }
    if (typeof c === 'string') {
      const j = JSON.parse(c);
      if (Array.isArray(j)) { rawList = j; break; }
    }
  } catch {}
}

// ⚠️ ACHATA caso venha `[[...]]`
const flatList: any[] = Array.isArray(rawList)
  ? rawList.flatMap((x) => Array.isArray(x) ? x : [x])
  : [];

// se nada ainda, tenta fallback de um único arquivo “solto”
if (!flatList.length) {
  const maybeUrl =
    msg.file_url || msg.fileUrl || msg.publicUrl || msg.signedUrl || msg.url || msg.path;
  if (maybeUrl) {
    flatList.push({
      url: maybeUrl,
      name:
        msg.file_name ||
        msg.fileName ||
        String(maybeUrl).split('?')[0].split('/').pop() ||
        'arquivo',
      type: String(msg.content_type || msg.mimeType || '').toLowerCase(),
      size: Number(msg.size || msg.bytes || msg.file_size || 0),
    });
  }
}

// helper: deduz mime pela extensão
function extToMime(name = '') {
  const n = name.toLowerCase();
  if (n.endsWith('.webm')) return 'video/webm';
  if (n.endsWith('.m4a'))  return 'audio/mp4';
  if (n.endsWith('.mp3'))  return 'audio/mpeg';
  if (n.endsWith('.ogg'))  return 'audio/ogg';
  if (n.endsWith('.wav'))  return 'audio/wav';
  return 'application/octet-stream';
}

const attachments = flatList
  .map((a) => {
    const url =
      a?.url || a?.file_url || a?.publicUrl || a?.signedUrl || a?.fullUrl || a?.path;
    if (!url) return null;

    let name =
  a?.name ||
  a?.file_name ||
  String(url).split('?')[0].split('/').pop() ||
  'arquivo';

if (!/\.[a-z0-9]{2,5}$/i.test(name)) {
  // Se não tem extensão, tenta deduzir pelo MIME
  if ((a?.type || '').startsWith('image/')) name += '.jpg';
  else if ((a?.type || '').startsWith('audio/')) name += '.mp3';
  else name += '.dat';
}

    let type = String(a?.type || a?.content_type || a?.mimeType || '').toLowerCase();

// Se ainda vazio ou genérico, deduz pela extensão
if (!type || type === 'application/octet-stream') {
  type = extToMime(name);
}

    const size =
      typeof a?.size === 'number' ? a.size
      : typeof a?.file_size === 'number' ? a.file_size
      : typeof a?.bytes === 'number' ? a.bytes
      : 0;

    return { name, url, type, size };
  })
  .filter(Boolean);

// (debug) ver no console já “achatado”
if (attachments.length) {
  console.log('[chat] anexos normalizados (flat):', msg.id, attachments);
}
// 🔼🔼🔼 FIM DO BLOCO

  return {
    id: msg.id,
    senderName: msg.sender_name ?? 'Usuário',
    senderType: msg.sender_type === 'support' ? 'admin' : msg.sender_type,
    content: await tryDecrypt(msg.content || msg.message || ''),
    timestamp: new Date(msg.created_at),
    _senderId: msg.sender_id,
    _readBy: msg.read_by || [],
    avatarUrl: (msg.sender_avatar_url as string) || undefined,
    attachments, // ✅ usa os attachments normalizados
  } as UIChatMessage;
})
    );

    setFormattedAllMessages(mapped as any);
  })();
}, [messages, updateTick]);

  const names = typingUsers.map(u => u.name || 'Alguém').join(', ');
  const isPlural = typingUsers.length > 1;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* 🔔 player invisível para o ding */}
    <audio ref={dingRef} preload="auto">
  <source src="/sounds/ding.mp3/light-562.mp3" type="audio/mpeg" />
</audio>
      <div className="shrink-0">
        <ChatHeader
          name={conversationName}
          avatar={conversationAvatar}
          status={conversationStatus}
          type={conversationType}
          conversationId={conversationId}
          petitionId={petitionId}
          messageCount={messages.length}
          files={files}
          onDownloadFile={(file) => {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.click();
          }}
          onInfo={() => {}}
          showBackButton={false}
          onBack={onClose}
        />
        <Separator />
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleScrollContainer}
   className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-4"
        >
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando mensagens...</p>
          ) : formattedAllMessages.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            formattedAllMessages.map((msg: any) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                allMessages={formattedAllMessages}
                isOwn={msg._senderId === userId}
                showTimestamp
                onRetry={undefined}
                onEdit={undefined}
                onDelete={undefined}
                onReport={undefined}
                readBy={(msg as any)._readBy} // ✅ usado para ✓/✓✓
              />
            ))
          )}

          {/* Indicador "digitando..." */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500">
              {names} {isPlural ? 'estão digitando' : 'está digitando'}
              <span className="inline-flex ml-1 gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce [animation-delay:0.15s]">•</span>
                <span className="animate-bounce [animation-delay:0.3s]">•</span>
              </span>
            </div>
          )}

          {/* âncora do final — ajuda o scrollIntoView */}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t bg-white px-4 py-2">
          <ChatInput
            value={messageText}
            onChange={handleChange}
            onSubmit={handleSend}
            onFileSelect={setSelectedFiles}
            selectedFiles={selectedFiles}
            disabled={isLoading}
            placeholder={`Digite como ${userName}...`}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedChat;
