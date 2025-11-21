import { useState } from 'react';
import { EmailService } from '@/services/emailService';
import { useNewAuth } from '@/contexts/NewAuthContext';

export function useEmail() {
  const { user } = useNewAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verificar se o usuário tem notificações por email ativadas
   */
  const canSendEmail = async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      // Aqui você pode buscar as preferências do usuário do banco
      // Por enquanto, vamos assumir que sim
      return true;
    } catch (err) {
      console.error('Erro ao verificar preferências de email:', err);
      return false;
    }
  };

  /**
   * Enviar email de boas-vindas para clientes (inclui bônus de petição grátis)
   */
  const sendWelcomeEmail = async (to: string, userName: string): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendWelcomeEmail(to, userName);
      
      if (!success) {
        setError('Falha ao enviar email de boas-vindas');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de boas-vindas para redatores
   */
  const sendWriterWelcomeEmail = async (to: string, userName: string): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendWriterWelcomeEmail(to, userName);
      
      if (!success) {
        setError('Falha ao enviar email de boas-vindas para redator');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de cadastro não aprovado para redatores
   */
  const sendWriterRejectionEmail = async (to: string, userName: string): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendWriterRejectionEmail(to, userName);
      
      if (!success) {
        setError('Falha ao enviar email de rejeição para redator');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de suspensão para redatores
   */
  const sendWriterSuspensionEmail = async (
    to: string, 
    userName: string, 
    lateCount: number = 3,
    suspensionDays: number = 30
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendWriterSuspensionEmail(to, userName, lateCount, suspensionDays);
      
      if (!success) {
        setError('Falha ao enviar email de suspensão para redator');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de bloqueio permanente para redatores
   */
  const sendWriterBlockEmail = async (
    to: string, 
    userName: string, 
    lateCount: number = 9
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendWriterBlockEmail(to, userName, lateCount);
      
      if (!success) {
        setError('Falha ao enviar email de bloqueio para redator');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de pedido de correção
   */
  const sendRevisionRequestEmail = async (
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    revisionNotes: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendRevisionRequestEmail(
        to,
        writerName,
        petitionId,
        petitionTitle,
        revisionNotes
      );
      
      if (!success) {
        setError('Falha ao enviar email de pedido de correção');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de lembrete de nota fiscal
   */
  const sendInvoiceReminderEmail = async (
    to: string,
    writerName: string,
    month: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendInvoiceReminderEmail(to, writerName, month);
      
      if (!success) {
        setError('Falha ao enviar email de lembrete de nota fiscal');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de notificação de nova mensagem no chat
   */
  const sendNewChatMessageEmail = async (
    to: string,
    recipientName: string,
    senderName: string,
    chatContext: string = 'Mensagem relacionada à sua petição'
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendNewChatMessageEmail(to, recipientName, senderName, chatContext);
      
      if (!success) {
        setError('Falha ao enviar email de notificação de mensagem');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de atribuição de petição ao redator
   */
  const sendPetitionAssignedEmail = async (
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    deadline?: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPetitionAssignedEmail(
        to,
        writerName,
        petitionId,
        petitionTitle,
        deadline
      );
      
      if (!success) {
        setError('Falha ao enviar email de atribuição de petição');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de petição aprovada pelo cliente (para o redator)
   */
  const sendPetitionApprovedEmail = async (
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    clientName?: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPetitionApprovedEmail(
        to,
        writerName,
        petitionId,
        petitionTitle,
        clientName
      );
      
      if (!success) {
        setError('Falha ao enviar email de petição aprovada');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de confirmação de aceitação de petição (redator aceita petição)
   */
  const sendWriterAcceptedPetitionEmail = async (
    to: string,
    writerName: string,
    petitionId: string,
    petitionTitle: string,
    petitionValue: string,
    deadline: string,
    clientName?: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendWriterAcceptedPetitionEmail(
        to,
        writerName,
        petitionId,
        petitionTitle,
        petitionValue,
        deadline,
        clientName
      );
      
      if (!success) {
        setError('Falha ao enviar email de confirmação de aceitação de petição');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de notificação de petições disponíveis (redator)
   */
  const sendAvailablePetitionsEmail = async (
    to: string,
    writerName: string,
    petitionsCount: number
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendAvailablePetitionsEmail(
        to,
        writerName,
        petitionsCount
      );
      
      if (!success) {
        setError('Falha ao enviar email de petições disponíveis');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de notificação de aceitação de petição pelo redator (cliente)
   */
  const sendClientPetitionAcceptedEmail = async (
    to: string,
    clientName: string,
    petitionId: string,
    petitionTitle: string,
    writerName: string,
    deadline: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendClientPetitionAcceptedEmail(
        to,
        clientName,
        petitionId,
        petitionTitle,
        writerName,
        deadline
      );
      
      if (!success) {
        setError('Falha ao enviar email de aceitação de petição ao cliente');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de notificação de retorno de correção (cliente)
   */
  const sendClientPetitionReturnedFromRevisionEmail = async (
    to: string,
    clientName: string,
    petitionId: string,
    petitionTitle: string,
    writerName: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendClientPetitionReturnedFromRevisionEmail(
        to,
        clientName,
        petitionId,
        petitionTitle,
        writerName
      );
      
      if (!success) {
        setError('Falha ao enviar email de retorno de correção ao cliente');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de notificação de retorno do corretor (cliente)
   */
  const sendClientPetitionReturnedFromProofreadingEmail = async (
    to: string,
    clientName: string,
    petitionId: string,
    petitionTitle: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendClientPetitionReturnedFromProofreadingEmail(
        to,
        clientName,
        petitionId,
        petitionTitle
      );
      
      if (!success) {
        setError('Falha ao enviar email de retorno do corretor ao cliente');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de nova petição
   */
  const sendNewPetitionEmail = async (
    to: string,
    userName: string,
    petitionTitle: string,
    petitionId: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendNewPetitionEmail(
        to,
        userName,
        petitionTitle,
        petitionId
      );
      
      if (!success) {
        setError('Falha ao enviar email de nova petição');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de petição concluída
   */
  const sendPetitionCompletedEmail = async (
    to: string,
    userName: string,
    petitionTitle: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPetitionCompletedEmail(
        to,
        userName,
        petitionTitle
      );
      
      if (!success) {
        setError('Falha ao enviar email de petição concluída');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de redefinição de senha
   */
  const sendPasswordResetEmail = async (
    to: string,
    userName: string,
    resetLink: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const success = await EmailService.sendPasswordResetEmail(
        to,
        userName,
        resetLink
      );
      
      if (!success) {
        setError('Falha ao enviar email de redefinição de senha');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de confirmação de cadastro
   */
  const sendEmailConfirmation = async (
    to: string,
    confirmationUrl: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const success = await EmailService.sendEmailConfirmation(
        to,
        confirmationUrl
      );
      
      if (!success) {
        setError('Falha ao enviar email de confirmação');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email personalizado
   */
  const sendCustomEmail = async (
    to: string | string[],
    subject: string,
    html: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const success = await EmailService.sendEmail({
        to,
        subject,
        html
      });
      
      if (!success) {
        setError('Falha ao enviar email');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de confirmação de contratação de plano
   */
  const sendPlanSubscriptionEmail = async (
    to: string,
    clientName: string,
    planName: 'Free' | 'Start' | 'Pro' | 'Elite',
    planDetails: {
      petitionsLimit: number;
      features: string[];
    }
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPlanSubscriptionEmail(
        to,
        clientName,
        planName,
        planDetails
      );
      
      if (!success) {
        setError('Falha ao enviar email de confirmação de plano');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de renovação ou troca de plano
   */
  const sendPlanRenewalOrChangeEmail = async (
    to: string,
    clientName: string,
    newPlanName: 'Free' | 'Start' | 'Pro' | 'Elite',
    planDetails: {
      petitionsLimit: number;
      features: string[];
    },
    oldPlanName?: 'Free' | 'Start' | 'Pro' | 'Elite'
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPlanRenewalOrChangeEmail(
        to,
        clientName,
        newPlanName,
        planDetails,
        oldPlanName
      );
      
      if (!success) {
        setError('Falha ao enviar email de renovação/troca de plano');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de aviso de limite de petições próximo
   */
  const sendPlanLimitWarningEmail = async (
    to: string,
    clientName: string,
    currentPlanName: 'Start' | 'Pro' | 'Elite',
    remainingPetitions: number,
    totalPetitions: number
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPlanLimitWarningEmail(
        to,
        clientName,
        currentPlanName,
        remainingPetitions,
        totalPetitions
      );
      
      if (!success) {
        setError('Falha ao enviar email de aviso de limite de plano');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  /**
   * Enviar email de cancelamento de plano
   */
  const sendPlanCancellationEmail = async (
    to: string,
    clientName: string,
    cancelledPlanName: 'Start' | 'Pro' | 'Elite',
    unusedPetitions: number,
    cancellationDate: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const canSend = await canSendEmail();
      if (!canSend) {
        console.log('📧 Email não enviado: usuário desativou notificações');
        return false;
      }

      const success = await EmailService.sendPlanCancellationEmail(
        to,
        clientName,
        cancelledPlanName,
        unusedPetitions,
        cancellationDate
      );
      
      if (!success) {
        setError('Falha ao enviar email de cancelamento de plano');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    error,
    sendWelcomeEmail,
    sendWriterWelcomeEmail,
    sendWriterRejectionEmail,
    sendWriterSuspensionEmail,
    sendWriterBlockEmail,
    sendRevisionRequestEmail,
    sendInvoiceReminderEmail,
    sendNewChatMessageEmail,
    sendPetitionAssignedEmail,
    sendPetitionApprovedEmail,
    sendWriterAcceptedPetitionEmail,
    sendAvailablePetitionsEmail,
    sendClientPetitionAcceptedEmail,
    sendClientPetitionReturnedFromRevisionEmail,
    sendClientPetitionReturnedFromProofreadingEmail,
    sendPlanSubscriptionEmail,
    sendPlanRenewalOrChangeEmail,
    sendPlanLimitWarningEmail,
    sendPlanCancellationEmail,
    sendNewPetitionEmail,
    sendPetitionCompletedEmail,
    sendPasswordResetEmail,
    sendEmailConfirmation,
    sendCustomEmail
  };
}

