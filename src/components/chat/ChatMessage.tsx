// src/components/chat/ChatMessage.tsx
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ChatAttachment } from '@/lib/chatService';
import { cn } from '@/lib/utils';

export type UIChatMessage = {
  id: string;
  senderName: string;
  senderType?: 'admin' | 'writer' | 'client';
  content: string;
  timestamp: Date;
  replyTo?: string;
  avatarUrl?: string;
  attachments?: ChatAttachment[];
};

interface ChatMessageProps {
  message: UIChatMessage;
  allMessages: UIChatMessage[];
  isOwn: boolean;
  showTimestamp?: boolean;
  onRetry?: () => void;
  onEdit?: (id: string, newContent: string) => void;
  onDelete?: (id: string) => void;
  onReport?: () => void;
  readBy?: string[];
}

/* ---------------- helpers ---------------- */

const isImage = (t?: string, name?: string) => {
  const mime = (t || '').toLowerCase();
  return (
    mime.startsWith('image/') ||
    mime === 'image/jpg' ||
    /\.(png|jpg|jpeg|gif|webp)$/i.test((name || '').toLowerCase())
  );
};

function formatBytes(n?: number) {
  if (!n || n <= 0) return '';
  const u = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(n)/Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
}

// ✅ detector de áudio com fallbacks
function isAudioLike(att: { type?: string; name?: string }): boolean {
  const mime = (att.type || '').toLowerCase();
  const name = (att.name || '').toLowerCase();
  const byExt = /\.(webm|m4a|mp3|ogg|wav)$/i.test(name);

  return (
    mime.startsWith('audio/') ||
    mime === 'video/webm' ||      // opus em webm
    (!mime && byExt) ||           // 👈 MIME vazio, decide pela extensão
    (mime === 'application/octet-stream' && byExt)
  );
}

/** Mostra quem já leu (opcional) */
const ReadInfo: React.FC<{ readBy?: string[]; selfName: string }> = ({
  readBy = [],
  selfName,
}) => {
  if (!readBy.length) return null;
  const others = readBy.filter((n) => n && n !== selfName);
  return (
    <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
      {others.length > 0 ? `Visto por ${others.join(', ')}` : 'Visto'}
    </div>
  );
};

/** Linkifica URLs/emails preservando quebras de linha */
function renderContent(text: string, isOwn: boolean) {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex =
    /((https?:\/\/[^\s]+)|(\bwww\.[^\s]+)|(mailto:)?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}))/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [full] = match;
    const index = match.index;

    if (index > lastIndex) parts.push(text.slice(lastIndex, index));

    let href = full;
    if (/^www\./i.test(full)) href = `https://${full}`;
    if (/^[A-Z0-9._%+-]+@/i.test(full) && !/^mailto:/i.test(full)) href = `mailto:${full}`;

    parts.push(
      <a
        key={`${index}-${full}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline ${
          isOwn
            ? 'decoration-white/70 hover:decoration-white'
            : 'decoration-orange-600/70 hover:decoration-orange-600'
        }`}
      >
        {full}
      </a>
    );

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts;
}

/* ---------------- component ---------------- */

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  allMessages,
  isOwn,
  showTimestamp = true,
  onRetry,
  onEdit,
  onDelete,
  onReport,
  readBy = [],
}) => {
  return (
    <div className={`relative flex ${isOwn ? 'justify-end pr-8' : 'justify-start pl-8'} my-2`}>
      <div
  className={cn(
    'relative rounded-2xl px-4 py-3 max-w-[78%] sm:max-w-[72%] md:max-w-[68%] shadow-md ring-1 transition',
    isOwn
      ? 'bg-gradient-to-tr from-orange-600 to-orange-500 text-white ring-orange-500/20'
      : 'bg-orange-50/80 text-[#7A2E12] dark:bg-[#2A130B] dark:text-[#FFE8DC] ring-black/5'
  )}
>
        {/* Cabeçalho */}
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <span>{message.senderName}</span>
          {message.senderType && (
            <Badge className="text-[10px] font-medium px-2 py-[2px] rounded-full bg-white text-orange-700 border border-white dark:bg-white dark:text-orange-800">
              {message.senderType === 'admin'
                ? 'Suporte Veredicta'
                : message.senderType === 'writer'
                ? 'Redator'
                : 'Cliente'}
            </Badge>
          )}
          {showTimestamp && (
  <span
    title={format(message.timestamp, "PPpp", { locale: ptBR })}
    className={cn(
      'text-[11px] ml-auto select-none',
      isOwn ? 'text-white/80' : 'text-orange-700/70'
    )}
  >
    {format(message.timestamp, 'p', { locale: ptBR })}
  </span>
)}
        </div>

        {/* Conteúdo */}
        {message.content && (
  <div className="text-[13.5px] leading-relaxed break-words whitespace-pre-wrap max-w-[360px]">
    {renderContent(message.content, isOwn)}
  </div>
)}
        
    {/* Anexos (uma única vez) */}
{Array.isArray(message.attachments) && message.attachments.length > 0 && (
  <div className="mt-2 space-y-2 px-1">
    {message.attachments.map((att, idx) => {
      // ✅ aceita http(s), blob: e data:
      const isValidUrl = (u: string) => /^https?:|^blob:|^data:/.test(u);
      if (!att?.url || typeof att.url !== 'string' || !isValidUrl(att.url)) return null;

      const mime = (att.type || '').toLowerCase();
      const isImg =
        mime.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp)$/i.test(att.name || '') ||
        /\.(png|jpe?g|gif|webp)$/i.test(att.url || '');

      // IMG
      if (isImg) {
        return (
          <a key={att.url || String(idx)} href={encodeURI(att.url)} target="_blank" rel="noreferrer">
            <img
              src={encodeURI(att.url)}
              alt={att.name || 'imagem'}
              className="w-full h-auto max-h-44 rounded-md border object-contain"
              loading="lazy"
            />
          </a>
        );
      }

      // ÁUDIO
      if (isAudioLike(att)) {
        const src = encodeURI(att.url || '');
        return (
          <div
            key={att.url || String(idx)}
            className={cn(
  'rounded-xl border p-2.5',
  isOwn ? 'bg-white/10 border-white/25 backdrop-blur-[2px]' : 'bg-white border-gray-200'
)}

          >
            <div className={cn('text-xs mb-1', isOwn ? 'text-white/80' : 'text-gray-700')}>
              {att.name || 'Áudio'}{att.size ? ` • ${formatBytes(att.size)}` : ''}
            </div>
            <audio
              controls
              preload="metadata"
              src={src}
              className="w-full"
              controlsList="nodownload noplaybackrate noremoteplayback"
            />
            <div className={cn('mt-1 text-[11px] flex justify-between', isOwn ? 'text-white/70' : 'text-gray-500')}>
              <a
                href={src}
                download
                className={isOwn ? 'underline decoration-white/60' : 'underline decoration-orange-600/60'}
              >
                Baixar
              </a>
            </div>
          </div>
        );
      }

      // OUTROS (PDF, DOC, etc.) – cartão clicável que abre sem duplicar
      const openAttachment = (url: string) => {
        const a = document.createElement('a');
        a.href = encodeURI(url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      return (
        <React.Fragment key={att.url || String(idx)}>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openAttachment(att.url);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                openAttachment(att.url);
              }
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer relative z-10',
              isOwn ? 'bg-white/10 border-white/30 text-white' : 'bg-white border-gray-200 text-gray-800'
            )}
            title={att.name}
          >
            <div className="truncate pr-2">
              <div className="truncate font-medium">{att.name}</div>
              <div className={cn('text-xs', isOwn ? 'text-white/70' : 'text-gray-500')}>
                {formatBytes(att.size)} • {(att.type || '').split('/')[1] || 'arquivo'}
              </div>
            </div>
            <span className={cn('ml-2 shrink-0 text-xs', isOwn ? 'text-white' : 'text-orange-700')}>Abrir</span>
          </div>

          {/* link de download opcional */}
          <div className={cn('mt-1 text-[11px]', isOwn ? 'text-white/70' : 'text-gray-500')}>
            <a
              href={encodeURI(att.url)}
              download
              className={isOwn ? 'underline decoration-white/60' : 'underline decoration-orange-600/60'}
            >
              Baixar
            </a>
          </div>
        </React.Fragment>
      );
    })}
  </div>
)}

        {/* Cauda fina no canto inferior */}
        <span
          className={`pointer-events-none absolute bottom-1 w-0 h-0 z-0 ${
            isOwn
              ? 'right-[-8px] border-l-[8px] border-y-[5px] border-l-orange-600 border-y-transparent dark:border-l-orange-600'
              : 'left-[-8px]  border-r-[8px] border-y-[5px] border-r-orange-50  border-y-transparent dark:border-r-orange-900'
          }`}
          aria-hidden="true"
        />

        {/* Avatar mini (por cima da cauda) */}
        <span
          className={`absolute bottom-0 h-6 w-6 rounded-full overflow-hidden shadow ring-2 ring-white bg-white flex items-center justify-center text-[10px] font-semibold z-10 ${
            isOwn ? 'right-[-26px]' : 'left-[-26px]'
          }`}
          aria-hidden="true"
          title={message.senderName}
        >
          <UserAvatar
            size="sm"
            className="h-6 w-6"
          />
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
