export const generateQuickReplies = (context: 'client' | 'writer' | 'admin' | 'support'): string[] => {
  const commonReplies = [
    "Obrigado pela mensagem!",
    "Entendi, vou verificar.",
    "Pode deixar comigo.",
    "Aguarde um momento, por favor."
  ];

  const contextSpecificReplies = {
    client: [
      "Preciso de mais informações sobre isso.",
      "Vou retornar com uma resposta em breve.",
      "Documento recebido com sucesso.",
      "Há mais alguma dúvida?"
    ],
    writer: [
      "Estou trabalhando na sua solicitação.",
      "Vou analisar os documentos enviados.",
      "A petição está em andamento.",
      "Preciso de esclarecimentos adicionais."
    ],
    admin: [
      "Problema identificado, vou resolver.",
      "Encaminhando para o setor responsável.",
      "Sua solicitação foi registrada.",
      "Acompanhe o status no seu painel."
    ],
    support: [
      "Como posso ajudá-lo hoje?",
      "Vou verificar isso para você.",
      "Problema técnico identificado.",
      "Tente fazer logout e login novamente."
    ]
  };

  return [...commonReplies, ...contextSpecificReplies[context]];
};

export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'agora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const detectMessageMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

export const highlightMentions = (content: string): string => {
  return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isDocumentFile = (mimeType: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return documentTypes.includes(mimeType);
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateConversationId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const truncateMessage = (message: string, maxLength: number = 50): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

export const getMessageStatusColor = (status?: string): string => {
  switch (status) {
    case 'sending':
      return 'text-gray-400';
    case 'sent':
      return 'text-gray-500';
    case 'delivered':
      return 'text-blue-500';
    case 'read':
      return 'text-green-500';
    case 'failed':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

export const shouldGroupMessages = (
  currentMsg: { sender: string; timestamp: Date | string },
  previousMsg: { sender: string; timestamp: Date | string },
  timeThresholdMinutes: number = 5
): boolean => {
  if (!previousMsg || currentMsg.sender !== previousMsg.sender) {
    return false;
  }

  const timeDiff = Math.abs(
    new Date(currentMsg.timestamp).getTime() - new Date(previousMsg.timestamp).getTime()
  );
  
  return timeDiff < timeThresholdMinutes * 60 * 1000;
};