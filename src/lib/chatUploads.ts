// src/lib/chatUploads.ts
import { supabase } from '@/lib/supabaseClient'

const CHAT_BUCKET = 'chat_attachments';

function sanitizeFileName(original: string): string {
  const noAccents = (original || 'arquivo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const safe = noAccents.replace(/[^\w.\-]+/g, '_');
  return safe.slice(0, 140);
}

function extToMimeByName(name = '', fallback = 'application/octet-stream') {
  const n = name.toLowerCase();
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.gif')) return 'image/gif';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.mp4')) return 'video/mp4';
  if (n.endsWith('.webm')) return 'video/webm';
  if (n.endsWith('.mp3')) return 'audio/mpeg';
  if (n.endsWith('.wav')) return 'audio/wav';
  if (n.endsWith('.ogg')) return 'audio/ogg';
  if (n.endsWith('.pdf')) return 'application/pdf';
  return fallback;
}

export type ChatAttachment = {
  name: string;
  url: string;
  type: string;
  size: number;
};

/**
 * Cria a linha da mensagem, sobe arquivos no Storage e atualiza a linha com attachments.
 * Não altera funções antigas; é só um helper novo.
 */
export async function sendMessageWithFiles(
  conversationId: string,
  content: string,
  files: File[]
) {
  // 1) usuário atual
  const { data: au, error: authErr } = await supabase.auth.getUser();
  if (authErr || !au?.user) throw new Error('Usuário não autenticado');

  const uid = au.user.id;
  const senderName =
    (au.user.user_metadata?.full_name as string) ||
    (au.user.user_metadata?.name as string) ||
    au.user.email ||
    'Usuário';

  // 2) cria a mensagem inicialmente (sem anexos)
  const { data: inserted, error: insErr } = await supabase
    .from('app_d379dcb283_messages')
    .insert({
      conversation_id: conversationId,
      content: (content || '').trim(),
      sender_id: uid,
      sender_name: senderName,
      // ajuste se quiser tipar por papel:
      // sender_type: 'writer' | 'client' | 'admin'
      attachments: [],
      status: 'sent',
    })
    .select('*')
    .single();

  if (insErr || !inserted) throw insErr ?? new Error('Falha ao criar mensagem');

  const messageId = inserted.id as string;

  // 3) sobe cada arquivo no Storage
  const uploaded: ChatAttachment[] = [];
  for (const file of files) {
    const safe = `${Date.now()}-${sanitizeFileName(file.name || 'arquivo.dat')}`;
    const path = `${conversationId}/${messageId}/${safe}`;

    // detecta MIME confiável
    let contentType = file.type || extToMimeByName(safe);

    const up = await supabase.storage
      .from(CHAT_BUCKET)
      .upload(path, file, { upsert: true, contentType });

    if (up.error) {
      console.warn('[upload]', up.error.message);
      continue;
    }

    const { data: pub } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(path);

    uploaded.push({
      name: safe,
      url: encodeURI(pub.publicUrl),
      type: contentType.replace('image/jpg', 'image/jpeg'),
      size: file.size || 0,
    });
  }

  // 4) se subiu algo, atualiza a linha com attachments
  if (uploaded.length) {
    await supabase
      .from('app_d379dcb283_messages')
      .update({ attachments: uploaded })
      .eq('id', messageId);
  }

  // 5) atualiza resumo da conversa (não é obrigatório, mas deixa a lista bonita)
  try {
    const preview = (content || '').trim() || (uploaded.length ? `📎 ${uploaded.length} arquivo(s)` : '');
    await supabase
      .from('conversations')
      .update({
        last_message: preview,
        last_message_time: inserted.created_at ?? new Date().toISOString(),
      })
      .eq('id', conversationId);
  } catch {
    // ok se RLS não permitir
  }

  return { ...inserted, attachments: uploaded };
}
