import { ChatService } from './chatService';

export class SupportBotService {
  private static readonly SUPPORT_USER_ID = 'support-admin';
  
  // Rastrear conversas que foram "assumidas" por humanos
  private static readonly humanTakenConversations = new Set<string>();
  
  // Respostas automáticas do suporte
  private static readonly AUTO_RESPONSES = {
    greetings: [
      'Olá! Como posso ajudá-lo hoje?',
      'Oi! Em que posso ser útil?',
      'Olá! Como posso ajudá-lo hoje?'
    ],
    help: [
      'Claro! Estou aqui para ajudar. Pode me contar mais detalhes?',
      'Perfeito! Vou fazer o possível para resolver sua questão.',
      'Entendido! Vou analisar sua solicitação.'
    ],
    audio: [
      'Recebi sua mensagem de áudio! Vou ouvir e responder em breve.',
      'Áudio recebido! Aguarde um momento para minha resposta.',
      'Perfeito! Sua mensagem de áudio foi enviada com sucesso.'
    ],
    default: [
      'Obrigado pela sua mensagem! Nossa equipe está analisando.',
      'Entendi sua solicitação. Estamos trabalhando para resolver.',
      'Mensagem recebida! Retornaremos em breve com uma solução.'
    ]
  };

  /**
   * Verificar se um humano assumiu a conversa
   */
  static async checkIfHumanTookOver(conversationId: string): Promise<boolean> {
    try {
      // Buscar as últimas mensagens da conversa
      const messages = await ChatService.getConversationMessages(conversationId);
      
      // Verificar se há mensagens recentes de usuários humanos do suporte
      const recentMessages = messages.slice(-5); // Últimas 5 mensagens
      
      for (const message of recentMessages) {
        // Se encontrar uma mensagem de um usuário humano (não 'support-admin')
        if (message.sender_id && message.sender_id !== this.SUPPORT_USER_ID && message.sender_id !== 'support-admin') {
          console.log('🤖 Bot detectou que humano assumiu a conversa:', conversationId);
          this.humanTakenConversations.add(conversationId);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar se humano assumiu conversa:', error);
      return false;
    }
  }

  /**
   * Simular resposta automática do suporte
   */
  static async simulateSupportResponse(
    conversationId: string, 
    userMessage: string, 
    messageType: 'text' | 'file' | 'image' | 'system' | 'audio' = 'text'
  ): Promise<void> {
    try {
      // Verificar se um humano já assumiu esta conversa
      if (this.humanTakenConversations.has(conversationId)) {
        console.log('🤖 Bot não responde - conversa assumida por humano:', conversationId);
        return;
      }

      // Verificar se um humano assumiu recentemente
      const humanTookOver = await this.checkIfHumanTookOver(conversationId);
      if (humanTookOver) {
        console.log('🤖 Bot não responde - humano assumiu recentemente:', conversationId);
        return;
      }

      // Aguardar um pouco para simular tempo de resposta
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Verificar novamente antes de enviar (caso humano tenha respondido durante a espera)
      if (this.humanTakenConversations.has(conversationId)) {
        console.log('🤖 Bot não responde - conversa assumida durante espera:', conversationId);
        return;
      }

      let response = this.getAutoResponse(userMessage, messageType);
      
      // Enviar resposta como suporte
      await ChatService.sendMessageAsSupport(
        conversationId,
        response,
        'text'
      );

      console.log('🤖 Resposta automática do suporte enviada:', response);
    } catch (error) {
      console.error('Erro ao enviar resposta automática do suporte:', error);
    }
  }

  /**
   * Obter resposta automática baseada na mensagem
   */
  private static getAutoResponse(userMessage: string, messageType: string): string {
    const message = userMessage.toLowerCase();
    
    // Respostas para áudio
    if (messageType === 'file' || message.includes('áudio') || message.includes('audio')) {
      return this.getRandomResponse(this.AUTO_RESPONSES.audio);
    }
    
    // Respostas para cumprimentos
    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || 
        message.includes('boa tarde') || message.includes('boa noite') || message.includes('hello')) {
      return this.getRandomResponse(this.AUTO_RESPONSES.greetings);
    }
    
    // Respostas para pedidos de ajuda
    if (message.includes('ajuda') || message.includes('help') || message.includes('problema') || 
        message.includes('erro') || message.includes('dúvida') || message.includes('como')) {
      return this.getRandomResponse(this.AUTO_RESPONSES.help);
    }
    
    // Resposta padrão
    return this.getRandomResponse(this.AUTO_RESPONSES.default);
  }

  /**
   * Obter resposta aleatória de um array
   */
  private static getRandomResponse(responses: string[]): string {
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * Verificar se uma conversa é de suporte
   */
  static async isSupportConversation(conversationId: string): Promise<boolean> {
    try {
      // Buscar informações da conversa
      const { data: conversation } = await ChatService.getConversationInfo(conversationId);
      return conversation?.type === 'support';
    } catch (error) {
      console.error('Erro ao verificar tipo da conversa:', error);
      return false;
    }
  }

  /**
   * Permitir que um humano assuma uma conversa (para usar no painel de suporte)
   */
  static humanTakeOverConversation(conversationId: string): void {
    this.humanTakenConversations.add(conversationId);
    console.log('👨‍💼 Humano assumiu conversa:', conversationId);
  }

  /**
   * Liberar conversa para bot novamente (para casos especiais)
   */
  static releaseConversationToBot(conversationId: string): void {
    this.humanTakenConversations.delete(conversationId);
    console.log('🤖 Conversa liberada para bot:', conversationId);
  }

  /**
   * Verificar se uma conversa está sendo gerenciada por humano
   */
  static isConversationManagedByHuman(conversationId: string): boolean {
    return this.humanTakenConversations.has(conversationId);
  }

  /**
   * Configurar listener para mensagens de suporte
   */
  static setupSupportListener(): any {
    // Esta função seria chamada quando o sistema de suporte estiver ativo
    // Por enquanto, é apenas um placeholder para futuras implementações
    console.log('Listener de suporte configurado');
  }
}
