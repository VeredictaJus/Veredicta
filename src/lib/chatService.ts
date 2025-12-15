// src/lib/chatService.ts
import { supabase } from './supabase';
import type { Message } from '@/lib/types';

// anexo salvo na coluna `attachments` da messages
export type ChatAttachment = {
  name: string;
  url: string;
  type: string;
  size: number;
};

// bucket do Supabase Storage para anexos do chat
const CHAT_BUCKET = 'chat_attachments';

/** Papéis aceitos no app */
export type SenderType = 'client' | 'writer' | 'admin' | 'support';

/** Mensagem (tabela: messages) */
export type ChatMessage = {
  id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_type?: SenderType;
  attachments?: ChatAttachment[];
  created_at?: string;
  read_by?: string[];
};

/** Conversa (tabela: conversations) */
export type ChatConversation = {
  id: string;
  name: string;
  type: 'client' | 'support' | 'admin' | 'writer';
  last_message: string;
  last_message_time: string | null;
  unreadCount: number;
  participant_ids: string[];
  messages?: Message[];
};

/* Utils */
function normalizeRole(roleRaw: unknown): SenderType {
  const r = String(roleRaw ?? '').toLowerCase();
  if (r === 'support') return 'admin'; // suporte = admin
  if (r === 'admin' || r === 'writer' || r === 'client') return r as SenderType;
  return 'client';
}

async function getAuthUser() {
  // ✅ CORREÇÃO: Usar auth exportado do firebase.ts para evitar múltiplas inicializações
  const { auth } = await import('@/lib/firebase');

  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const u = auth.currentUser;

  const senderName =
    (u.displayName as string) ??
    (u.email ? String(u.email).split('@')[0] : undefined) ??
    'Você';

  return {
    id: u.uid, // Firebase UID
    role: 'client' as SenderType, // Default para clientes
    name: senderName,
  };
}

function sanitizeFileName(original: string): string {
  const noAccents = (original || 'arquivo')
    .normalize('NFD')                 // separa acentos
    .replace(/[\u0300-\u036f]/g, ''); // remove diacríticos

  // mantém letras, números, ponto, hífen e underline; troca o resto por "_"
  const safe = noAccents.replace(/[^\w.\-]+/g, '_');

  // evita nomes gigantes
  return safe.slice(0, 140);
}

/** Busca mensagens da conversa (antigas → novas) */
export async function fetchMessages(conversation_id: string): Promise<ChatMessage[]> {
  console.log(`🔍 fetchMessages: Buscando mensagens para conversa ${conversation_id}`);
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ fetchMessages: Erro ao buscar mensagens:', error);
    throw error;
  }
  
  console.log(`✅ fetchMessages: ${data?.length || 0} mensagens encontradas`);
  if (data && data.length > 0) {
    console.log('📋 fetchMessages: Primeira mensagem:', data[0]);
    const msgWithAttachments = data.find(m => m.attachments && m.attachments.length > 0);
    if (msgWithAttachments) {
      console.log('📎 fetchMessages: Mensagem com anexos encontrada:', msgWithAttachments);
    }
  }
  
  return (data || []) as ChatMessage[];
}

async function uploadAttachmentsToStorage(
  conversationId: string,
  messageId: string,
  files: File[]
): Promise<ChatAttachment[]> {
  const out: ChatAttachment[] = [];

  for (const file of files) {
    const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const path = `${conversationId}/${messageId}/${safeName}`;

    // detecta contentType confiável
    const lower = file.name.toLowerCase();
    let contentType = (file.type || '').split(';')[0] || 'application/octet-stream';

    if (!contentType || contentType === 'application/octet-stream') {
  const lower = file.name.toLowerCase();
   if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
  else if (lower.endsWith('.png'))  contentType = 'image/png';
  else if (lower.endsWith('.gif'))  contentType = 'image/gif';
  else if (lower.endsWith('.webp')) contentType = 'image/webp';
  else if (lower.endsWith('.bmp'))  contentType = 'image/bmp';
  else if (lower.endsWith('.svg'))  contentType = 'image/svg+xml';
  // vídeos (se usar webm/mp4 como vídeo)
  else if (lower.endsWith('.mp4'))  contentType = 'video/mp4';
  else if (lower.endsWith('.webm')) contentType = 'video/webm';
  // ✅ áudios
  else if (lower.endsWith('.m4a'))  contentType = 'audio/mp4';
  else if (lower.endsWith('.mp3'))  contentType = 'audio/mpeg';
  else if (lower.endsWith('.wav'))  contentType = 'audio/wav';
  else if (lower.endsWith('.ogg'))  contentType = 'audio/ogg';
  else contentType = 'application/octet-stream';
}

    const up = await supabase.storage
      .from(CHAT_BUCKET)
      .upload(path, file, { upsert: true, contentType });

    if (up.error) {
      console.warn('[upload] falhou:', up.error.message);
      continue;
    }

    const { data: pub } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(path);

    out.push({
  name: safeName,   // 👈 usa o nome já sanitizado
  url: encodeURI(pub.publicUrl), // 👈 força a URL a ser segura
  type: (contentType || '').replace('image/jpg', 'image/jpeg'),
  size: file.size || 0,
});
  }

  // ✅ aqui sim, dentro da função
  return out;
}

/** Envia nova mensagem (com anexos opcionais) */
export async function sendMessage(
  conversation_id: string,
  content: string,
  attachments: File[] = []
): Promise<ChatMessage | null> {
  const text = (content ?? '').trim();
  const hasFiles = attachments.length > 0;

  if (!text && !hasFiles) return null;

  const me = await getAuthUser();

  // 1) usa a função send_message_v2 corrigida
  console.log('🔍 sendMessage: Chamando send_message_v2 com:', {
    conversation_id,
    content: text || '',
    sender_id: me.id,
    message_type: 'text'
  });

  const { data: messageId, error: rpcError } = await supabase.rpc('send_message_v2', {
    p_conversation_id: conversation_id,
    p_sender_id: me.id,
    p_content: text || '',
    p_message_type: 'text',
    p_file_url: null,
    p_file_name: null,
    p_file_size: null,
    p_file_type: null,
    p_reply_to_id: null
  });

  if (rpcError) {
    console.error('❌ sendMessage: Erro na função send_message_v2:', rpcError);
    throw rpcError;
  }

  console.log('✅ sendMessage: Mensagem salva com ID:', messageId);

  // 2) buscar a mensagem inserida para retornar
  const { data: inserted, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (fetchError || !inserted) {
    console.error('❌ sendMessage: Erro ao buscar mensagem inserida:', fetchError);
    throw fetchError ?? new Error('Falha ao buscar mensagem inserida');
  }

  let finalRow = inserted as ChatMessage;
  let uploaded: ChatAttachment[] = [];

  // 3) se houver arquivos, sobe para o Storage e atualiza a linha
  if (hasFiles) {
    console.log(`📤 sendMessage: Fazendo upload de ${attachments.length} arquivo(s)`);
    uploaded = await uploadAttachmentsToStorage(conversation_id, inserted.id, attachments);
    console.log(`✅ sendMessage: Upload concluído, ${uploaded.length} arquivo(s) enviado(s)`);

    if (uploaded.length) {
      console.log(`💾 sendMessage: Salvando attachments no banco:`, uploaded);
      const { data: updated, error: upErr } = await supabase
        .from('messages')
        .update({ attachments: uploaded })
        .eq('id', inserted.id)
        .select('*')
        .single();

      if (!upErr && updated) {
        console.log(`✅ sendMessage: Mensagem atualizada com anexos:`, updated);
        finalRow = updated as ChatMessage;
      } else if (upErr) {
        console.error(`❌ sendMessage: Erro ao atualizar mensagem com anexos:`, upErr);
      }
    }
  }

  // 4) atualiza a prévia/ordenador da conversa
  try {
    const preview = text || (uploaded.length ? `📎 ${uploaded.length} arquivo(s)` : '');
    await supabase
      .from('conversations')
      .update({
        last_message: preview,
        last_message_time: finalRow.created_at ?? new Date().toISOString(),
      })
      .eq('id', conversation_id);
  } catch {
    // ok se RLS bloquear
  }

  return finalRow;
}

// ✅ marca mensagens da conversa como lidas por este usuário (via RPC)
export async function markConversationAsRead(conversation_id: string, user_id: string) {
  try {
    const { error } = await supabase.rpc('fn_mark_conversation_read', {
      p_conversation_id: conversation_id, // nomes devem bater com a RPC no Supabase
      p_user_id: user_id,
    });
    if (error) {
      console.warn('markConversationAsRead RPC failed/missing:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('markConversationAsRead error:', e);
    return false;
  }
}

/** Assina INSERTs/UPDATEs em tempo real de uma conversa */
export function subscribeMessages(
  conversation_id: string,
  onUpsert: (m: ChatMessage) => void
): () => void {
  const ch = supabase
    .channel(`messages:${conversation_id}`)
    // quando cria a mensagem (attachments ainda vazio)
    .on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'messages',
    filter: `conversation_id=eq.${conversation_id}` },
  (payload) => onUpsert(payload.new as ChatMessage)
)
    // quando a linha é atualizada com attachments
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversation_id}` },
      (payload) => onUpsert(payload.new as ChatMessage)
    )
    .subscribe();

  return () => supabase.removeChannel(ch);
}

/** Carrega a conversa de suporte do usuário autenticado */
export async function getConversations(): Promise<ChatConversation[]> {
  const me = await getAuthUser();
  const supportConversationId = `support-${me.id}`;

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', supportConversationId)
    .order('last_message_time', { ascending: false });

  if (error) throw error;
  return (data || []) as ChatConversation[];
}
