// Tipos relacionados à petições
export type PetitionStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELIVERED'
  | 'REJECTED';

export type CorrectionRequest = {
  requested_at: string;
  reason: string;
  status: 'pending' | 'completed';
};

export type Petition = {
  id: string;
  client_id: string;
  writer_id: string;
  title: string;
  description: string;
  legal_area: string;
  complexity: string;
  estimated_hours: number;
  deadline: string;
  budget: number;
  status: PetitionStatus;
  attachments: any[];
  created_at: string;
  accepted_at?: string;
  delivered_at?: string;
  completed_at?: string;
  revision_reason?: string;
  correction_requests?: CorrectionRequest[];
  deadline_warning_sent: boolean;
  penalty_applied: boolean;
  chat_enabled: boolean;
  chat_auto_disabled: boolean;
  chat_disabled_at?: string;
  chat_reactivation_count?: number;
  rating?: number;
};

// Tipos relacionados a anexos de arquivos
export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

// Mensagem individual (usado em ChatMessage.tsx, useChatAPI.ts, etc.)
export type ChatMessageItem = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type?: 'client' | 'writer' | 'admin' | 'support'; // ← Confirmado
  content: string;
  created_at: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
  replyTo?: string;
};

// Conversa com mensagens
export type ExtendedConversationItem = {
  id: string;
  name: string;
  type: 'client' | 'support';
  participant_ids: string[];
  unreadCount: number;
  last_message: string;
  last_message_time: string;
  messages: ChatMessageItem[];
};

// Aliases para facilitar uso em outros lugares
export type Message = ChatMessageItem;
export type Conversation = ExtendedConversationItem;
