import { supabase } from '@/lib/supabaseClient'

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'writer' | 'admin' | 'support';
  content: string;
  timestamp: Date;
  isEdited?: boolean;
  editedAt?: Date;
  attachments?: FileAttachment[];
  reactions?: MessageReaction[];
  isEncrypted?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

interface ChatReport {
  id: string;
  messageId: string;
  conversationId: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  petitionId?: string;
  type: 'support' | 'writer_client' | 'admin_support';
  createdAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

class ChatAPI {
  private baseUrl = '/api/chat';
  private wsUrl = 'ws://localhost:3001/ws';
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageQueue: Array<{
    event: string;
    data: unknown;
    timestamp: number;
  }> = [];
  private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  constructor() {
    this.initWebSocket();
  }

  // WebSocket Implementation
  private initWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.reconnectWebSocket();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.reconnectWebSocket();
    }
  }

  private reconnectWebSocket() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Reconnecting WebSocket in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.initWebSocket(), delay);
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'new_message':
        this.emit('message_received', data.payload);
        break;
      case 'message_updated':
        this.emit('message_updated', data.payload);
        break;
      case 'message_deleted':
        this.emit('message_deleted', data.payload);
        break;
      case 'new_report':
        this.emit('report_received', data.payload);
        break;
      case 'report_updated':
        this.emit('report_updated', data.payload);
        break;
      case 'user_typing':
        this.emit('user_typing', data.payload);
        break;
      case 'user_online':
        this.emit('user_online', data.payload);
        break;
      case 'user_offline':
        this.emit('user_offline', data.payload);
        break;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendWebSocketMessage(message);
    }
  }

  private sendWebSocketMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  // Event System
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  async sendMessage(conversationId: string, content: string, attachments?: File[]): Promise<ChatMessage> {
  try {
    console.log("📩 ID da conversa usado para enviar:", conversationId); 
    
    // 🔹 Obtemos o usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Usuário não autenticado');

    const senderId = user.id;
    const senderName = user.user_metadata?.name || 'Desconhecido';
    const messageContent = content.trim();

    // 🔹 Envia a mensagem para o Supabase
    const response = await fetch('https://dmsodonmkffyvbuxtxec.supabase.co/rest/v1/app_d379dcb283_messages', {
      method: 'POST',
      headers: {
        'apikey': 'SUA_API_KEY_AQUI',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        content: messageContent,
        attachments: attachments || []
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao enviar mensagem: ${response.status} - ${errorText}`);
    }

    // 🔹 Aqui a mágica: sempre retorna um único objeto
    const data = await response.json();
    const message = Array.isArray(data) ? data[0] : data;

    // 🔹 Notificação em tempo real (quando tiver WebSocket rodando)
    this.sendWebSocketMessage?.({
      type: 'send_message',
      payload: { conversationId, messageId: message.id }
    });

    return message;

  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

  async getMessages(conversationId: string, offset = 0, limit = 50): Promise<ChatMessage[]> {
  try {
    const url = `${this.baseUrl}/messages/${conversationId}?offset=${offset}&limit=${limit}`;
    console.log('[DEBUG] URL da API usada para buscar mensagens:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting messages:', error);
    return this.getMessagesFromLocalStorage(conversationId);
  }
}

  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
  try {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        content: content.trim()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to edit message: ${response.statusText}`);
    }

    const message = await response.json();

    // Send real-time notification
    this.sendWebSocketMessage({
      type: 'edit_message',
      payload: { messageId, content }
    });

    return message;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
}

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }

      // Send real-time notification
      this.sendWebSocketMessage({
        type: 'delete_message',
        payload: { messageId }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Report API Methods
  async reportMessage(messageId: string, reason: string, details?: string): Promise<ChatReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ messageId, reason, details })
      });

      if (!response.ok) {
        throw new Error(`Failed to report message: ${response.statusText}`);
      }

      const report = await response.json();
      
      // Send real-time notification to admins
      this.sendWebSocketMessage({
        type: 'new_report',
        payload: report
      });

      return report;
    } catch (error) {
      console.error('Error reporting message:', error);
      // Fallback to localStorage for development
      return this.reportMessageToLocalStorage(messageId, reason, details);
    }
  }

  async getReports(offset = 0, limit = 50, status?: string): Promise<ChatReport[]> {
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString()
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`${this.baseUrl}/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get reports: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting reports:', error);
      // Fallback to localStorage for development
      return this.getReportsFromLocalStorage();
    }
  }

  async updateReportStatus(reportId: string, status: string, adminNotes?: string): Promise<ChatReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ status, adminNotes })
      });

      if (!response.ok) {
        throw new Error(`Failed to update report: ${response.statusText}`);
      }

      const report = await response.json();
      
      // Send real-time notification
      this.sendWebSocketMessage({
        type: 'report_updated',
        payload: report
      });

      return report;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  // Conversation API Methods
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get conversations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  async createConversation(participants: string[], type: string, petitionId?: string): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ participants, type, petitionId })
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Typing Indicators
  sendTyping(conversationId: string) {
    this.sendWebSocketMessage({
      type: 'typing',
      payload: { conversationId }
    });
  }

  stopTyping(conversationId: string) {
    this.sendWebSocketMessage({
      type: 'stop_typing',
      payload: { conversationId }
    });
  }

  // Presence Management
  setOnline() {
    this.sendWebSocketMessage({
      type: 'set_online'
    });
  }

  setOffline() {
    this.sendWebSocketMessage({
      type: 'set_offline'
    });
  }

  // Utility Methods
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  // Fallback Methods (LocalStorage)
  private getMessagesFromLocalStorage(conversationId: string): ChatMessage[] {
    const messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    return messages
      .filter((msg: ChatMessage) => msg.conversationId === conversationId)
      .map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
  }

  private reportMessageToLocalStorage(messageId: string, reason: string, details?: string): ChatReport {
    const report: ChatReport = {
      id: `report-${Date.now()}`,
      messageId,
      conversationId: 'local',
      reporterId: 'current-user',
      reporterName: 'Current User',
      reportedUserId: 'reported-user',
      reportedUserName: 'Reported User',
      reason,
      details,
      status: 'pending',
      timestamp: new Date()
    };

    const reports = JSON.parse(localStorage.getItem('chat_reports') || '[]');
    reports.push(report);
    localStorage.setItem('chat_reports', JSON.stringify(reports));

    return report;
  }

  private getReportsFromLocalStorage(): ChatReport[] {
    const reports = JSON.parse(localStorage.getItem('chat_reports') || '[]');
    return reports.map((report: any) => ({
      ...report,
      timestamp: new Date(report.timestamp),
      reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : undefined
    }));
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const chatAPI = new ChatAPI();
export type { ChatMessage, ChatReport, Conversation, FileAttachment, MessageReaction };