import { 
  welcomeEmailTemplate,
  writerWelcomeEmailTemplate,
  writerRejectionEmailTemplate,
  writerSuspensionEmailTemplate,
  writerBlockEmailTemplate,
  revisionRequestEmailTemplate,
  invoiceReminderEmailTemplate,
  newChatMessageEmailTemplate,
  petitionAssignedEmailTemplate,
  petitionApprovedEmailTemplate,
  writerAcceptedPetitionEmailTemplate,
  availablePetitionsEmailTemplate,
  clientPetitionAcceptedEmailTemplate,
  clientPetitionReturnedFromRevisionEmailTemplate,
  clientPetitionReturnedFromProofreadingEmailTemplate,
  planSubscriptionEmailTemplate,
  planRenewalOrChangeEmailTemplate,
  planLimitWarningEmailTemplate,
  planCancellationEmailTemplate,
  newPetitionEmailTemplate, 
  petitionCompletedEmailTemplate,
  passwordResetEmailTemplate,
  contactFormNotificationTemplate,
  ContactFormData
} from './emailTemplates';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string | string[];
}

export class EmailService {
  // Domínio verificado! ✅
  private static defaultFrom = 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>';

  /**
   * Enviar email genérico via API do backend
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      console.log('📧 Enviando email via API:', {
        to: options.to,
        subject: options.subject,
        from: options.from || this.defaultFrom,
        replyTo: options.replyTo
      });

      // Chamar a API do backend em vez de chamar Resend diretamente
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          from: options.from || this.defaultFrom,
          replyTo: options.replyTo
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro ao enviar email:', result);
        return false;
      }

      console.log('✅ Email enviado com sucesso:', result);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Email de boas-vindas para clientes (inclui bônus de petição grátis)
   */
  static async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = welcomeEmailTemplate(userName, appUrl);

    return this.sendEmail({
      to,
      subject: '🎉 Bem-vindo ao Veredicta - Petição Grátis Incluída!',
      html
    });
  }

  /**
   * Email de boas-vindas para redatores
   */
  static async sendWriterWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = writerWelcomeEmailTemplate(userName, appUrl);

    return this.sendEmail({
      to,
      subject: '🎉 Bem-vindo à Equipe Veredicta!',
      html
    });
  }

  /**
   * Email de cadastro não aprovado para redatores
   */
  static async sendWriterRejectionEmail(to: string, userName: string): Promise<boolean> {
    const html = writerRejectionEmailTemplate(userName);

    return this.sendEmail({
      to,
      subject: 'Sobre seu Cadastro - Veredicta',
      html
    });
  }

  /**
   * Email de suspensão de redator
   */
  static async sendWriterSuspensionEmail(
    to: string, 
    userName: string, 
    lateCount: number = 3,
    suspensionDays: number = 30
  ): Promise<boolean> {
    const html = writerSuspensionEmailTemplate(userName, lateCount, suspensionDays);

    return this.sendEmail({
      to,
      subject: 'Sobre sua Conta - Veredicta',
      html
    });
  }

  /**
   * Email de bloqueio permanente de redator
   */
  static async sendWriterBlockEmail(
    to: string, 
    userName: string, 
    lateCount: number = 9
  ): Promise<boolean> {
    const html = writerBlockEmailTemplate(userName, lateCount);

    return this.sendEmail({
      to,
      subject: 'Bloqueio de Conta - Veredicta',
      html
    });
  }

  /**
   * Email de pedido de correção (cliente solicitou revisão)
   */
  static async sendRevisionRequestEmail(
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    revisionNotes: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = revisionRequestEmailTemplate(writerName, petitionId, petitionTitle, revisionNotes, appUrl);

    return this.sendEmail({
      to,
      subject: `📝 Pedido de Correção: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de lembrete de nota fiscal
   */
  static async sendInvoiceReminderEmail(
    to: string,
    writerName: string,
    month: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = invoiceReminderEmailTemplate(writerName, month, appUrl);

    return this.sendEmail({
      to,
      subject: `🧾 Lembrete: Anexe sua Nota Fiscal - ${month}`,
      html
    });
  }

  /**
   * Email de notificação de nova mensagem no chat
   */
  static async sendNewChatMessageEmail(
    to: string,
    recipientName: string,
    senderName: string,
    chatContext: string = 'Mensagem relacionada à sua petição'
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = newChatMessageEmailTemplate(recipientName, senderName, chatContext, appUrl);

    return this.sendEmail({
      to,
      subject: `💬 Nova Mensagem de ${senderName}`,
      html
    });
  }

  /**
   * Email de atribuição de petição ao redator
   */
  static async sendPetitionAssignedEmail(
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    deadline?: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = petitionAssignedEmailTemplate(writerName, petitionId, petitionTitle, deadline, appUrl);

    return this.sendEmail({
      to,
      subject: `📋 Nova Petição Atribuída: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de petição aprovada pelo cliente (para o redator)
   */
  static async sendPetitionApprovedEmail(
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    clientName?: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = petitionApprovedEmailTemplate(writerName, petitionId, petitionTitle, clientName, appUrl);

    return this.sendEmail({
      to,
      subject: `🎉 Petição Aprovada: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de confirmação de aceitação de petição (redator aceita petição)
   */
  static async sendWriterAcceptedPetitionEmail(
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    petitionValue: string,
    deadline: string,
    clientName?: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = writerAcceptedPetitionEmailTemplate(
      writerName, 
      petitionId, 
      petitionTitle, 
      petitionValue, 
      deadline, 
      clientName, 
      appUrl
    );

    return this.sendEmail({
      to,
      subject: `✅ Confirmação: Petição Aceita - ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de notificação de petições disponíveis (redator)
   */
  static async sendAvailablePetitionsEmail(
    to: string,
    writerName: string,
    petitionsCount: number
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = availablePetitionsEmailTemplate(writerName, petitionsCount, appUrl);

    return this.sendEmail({
      to,
      subject: `📋 ${petitionsCount} ${petitionsCount === 1 ? 'Nova Petição Disponível' : 'Novas Petições Disponíveis'}`,
      html
    });
  }

  /**
   * Email de notificação de aceitação de petição pelo redator (cliente)
   */
  static async sendClientPetitionAcceptedEmail(
    to: string,
    clientName: string,
    petitionId: string,
    petitionTitle: string,
    writerName: string,
    deadline: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = clientPetitionAcceptedEmailTemplate(
      clientName,
      petitionId,
      petitionTitle,
      writerName,
      deadline,
      appUrl
    );

    return this.sendEmail({
      to,
      subject: `✅ Redator Aceitou Sua Petição: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de notificação de retorno de correção (cliente)
   */
  static async sendClientPetitionReturnedFromRevisionEmail(
    to: string,
    clientName: string,
    petitionId: string,
    petitionTitle: string,
    writerName: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = clientPetitionReturnedFromRevisionEmailTemplate(
      clientName,
      petitionId,
      petitionTitle,
      writerName,
      appUrl
    );

    return this.sendEmail({
      to,
      subject: `✅ Correções Finalizadas: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de notificação de retorno do corretor (cliente)
   */
  static async sendClientPetitionReturnedFromProofreadingEmail(
    to: string,
    clientName: string,
    petitionId: string,
    petitionTitle: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = clientPetitionReturnedFromProofreadingEmailTemplate(
      clientName,
      petitionId,
      petitionTitle,
      appUrl
    );

    return this.sendEmail({
      to,
      subject: `✅ Revisão Finalizada: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de notificação de nova petição
   */
  static async sendNewPetitionEmail(
    to: string, 
    userName: string, 
    petitionTitle: string,
    petitionId: string,
    deadline?: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = newPetitionEmailTemplate(userName, petitionTitle, petitionId, appUrl, deadline);

    return this.sendEmail({
      to,
      subject: `📄 Nova Petição Criada: ${petitionTitle}`,
      html
    });
  }

  /**
   * Email de petição concluída
   */
  static async sendPetitionCompletedEmail(
    to: string,
    userName: string,
    petitionTitle: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = petitionCompletedEmailTemplate(userName, petitionTitle, appUrl);

    return this.sendEmail({
      to,
      subject: `✅ Petição Concluída: ${petitionTitle}`,
      html
    });
  }

  /**
   * Emails relacionados ao formulário de contato do site
   */
  static async sendContactEmail(rawData: ContactFormData): Promise<{ success: boolean; message: string }> {
    const data: ContactFormData = {
      name: rawData.name?.trim() || 'Visitante',
      email: rawData.email?.trim() || '',
      subject: rawData.subject?.trim() || 'Contato pelo site',
      message: rawData.message?.trim() || '',
      phone: rawData.phone?.trim()
    };

    if (!data.email) {
      return {
        success: false,
        message: 'Informe um e-mail válido para contato.'
      };
    }

    if (!data.message) {
      return {
        success: false,
        message: 'Escreva uma mensagem antes de enviar.'
      };
    }

    const adminEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contato@veredictajus.com';
    const receivedAt = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const notificationHtml = contactFormNotificationTemplate(data, receivedAt);
    const notificationSubject = `📨 Contato do site: ${data.subject}`;

    const adminNotificationSent = await this.sendEmail({
      to: adminEmail,
      subject: notificationSubject,
      html: notificationHtml,
      replyTo: data.email
    });

    if (!adminNotificationSent) {
      return {
        success: false,
        message: 'Não foi possível enviar sua mensagem. Tente novamente em instantes.'
      };
    }

    return {
      success: true,
      message: 'Mensagem enviada com sucesso! Nossa equipe retornará em breve.'
    };
  }

  /**
   * Email de redefinição de senha
   */
  static async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetLink: string
  ): Promise<boolean> {
    const html = passwordResetEmailTemplate(userName, resetLink);

    return this.sendEmail({
      to,
      subject: '🔐 Redefinir Senha - Veredicta',
      html
    });
  }

  /**
   * Email de confirmação de contratação de plano
   */
  static async sendPlanSubscriptionEmail(
    to: string,
    clientName: string,
    planName: 'Free' | 'Start' | 'Pro' | 'Elite',
    planDetails: {
      petitionsLimit: number;
      features: string[];
    }
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = planSubscriptionEmailTemplate(clientName, planName, planDetails, appUrl);

    return this.sendEmail({
      to,
      subject: planName === 'Free' 
        ? '🎉 Bem-vindo ao Veredicta!' 
        : `💳 Plano ${planName} Confirmado - Veredicta`,
      html
    });
  }

  /**
   * Email de renovação ou troca de plano
   */
  static async sendPlanRenewalOrChangeEmail(
    to: string,
    clientName: string,
    newPlanName: 'Free' | 'Start' | 'Pro' | 'Elite',
    planDetails: {
      petitionsLimit: number;
      features: string[];
    },
    oldPlanName?: 'Free' | 'Start' | 'Pro' | 'Elite'
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = planRenewalOrChangeEmailTemplate(clientName, newPlanName, planDetails, oldPlanName, appUrl);

    const isRenewal = oldPlanName === newPlanName;
    const isUpgrade = oldPlanName && !isRenewal && ['Free', 'Start', 'Pro'].indexOf(oldPlanName) < ['Free', 'Start', 'Pro', 'Elite'].indexOf(newPlanName);

    return this.sendEmail({
      to,
      subject: isRenewal 
        ? `🔄 Plano ${newPlanName} Renovado - Veredicta`
        : isUpgrade
          ? `⬆️ Upgrade para ${newPlanName} Confirmado - Veredicta`
          : `🔄 Plano Alterado para ${newPlanName} - Veredicta`,
      html
    });
  }

  /**
   * Email de aviso de limite de petições próximo
   */
  static async sendPlanLimitWarningEmail(
    to: string,
    clientName: string,
    currentPlanName: 'Start' | 'Pro' | 'Elite',
    remainingPetitions: number,
    totalPetitions: number
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = planLimitWarningEmailTemplate(
      clientName,
      currentPlanName,
      remainingPetitions,
      totalPetitions,
      appUrl
    );

    return this.sendEmail({
      to,
      subject: `⚠️ Atenção: ${remainingPetitions === 1 ? 'Última Petição Disponível' : `Restam ${remainingPetitions} Petições`} - Veredicta`,
      html
    });
  }

  /**
   * Email de cancelamento de plano
   */
  static async sendPlanCancellationEmail(
    to: string,
    clientName: string,
    cancelledPlanName: 'Start' | 'Pro' | 'Elite',
    unusedPetitions: number,
    cancellationDate: string
  ): Promise<boolean> {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5176';
    const html = planCancellationEmailTemplate(
      clientName,
      cancelledPlanName,
      unusedPetitions,
      cancellationDate,
      appUrl
    );

    return this.sendEmail({
      to,
      subject: `❌ Cancelamento de Plano ${cancelledPlanName} Confirmado - Veredicta`,
      html
    });
  }
}
