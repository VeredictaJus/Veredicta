import { useState } from 'react';
import { EmailService } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [sending, setSending] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null);

  const handleTestWelcome = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const success = await EmailService.sendWelcomeEmail(email, nome);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de boas-vindas (Cliente) com petição grátis enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestWriterWelcome = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const success = await EmailService.sendWriterWelcomeEmail(email, nome);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de boas-vindas (Redator) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestWriterRejection = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const success = await EmailService.sendWriterRejectionEmail(email, nome);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de cadastro não aprovado (Redator) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestWriterSuspension = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const lateCount = 3;
      const suspensionDays = 30;
      const success = await EmailService.sendWriterSuspensionEmail(email, nome, lateCount, suspensionDays);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de suspensão (Redator) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestWriterBlock = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const lateCount = 9;
      const success = await EmailService.sendWriterBlockEmail(email, nome, lateCount);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de bloqueio (Redator) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestRevisionRequest = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const revisionNotes = 'Por favor, ajuste os seguintes pontos:\n\n1. Incluir fundamentação legal mais detalhada no artigo 205 do CPC\n2. Corrigir o valor da causa (deve ser R$ 50.000,00)\n3. Adicionar mais jurisprudências do STJ sobre o tema';
      
      const success = await EmailService.sendRevisionRequestEmail(email, nome, petitionId, petitionTitle, revisionNotes);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de pedido de correção enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestInvoiceReminder = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const month = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const success = await EmailService.sendInvoiceReminderEmail(email, nome, month);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de lembrete de nota fiscal enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestNewChatMessage = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const senderName = 'Dr. João Silva';
      const chatContext = 'Petição: Ação de Cobrança - Empresa XYZ';
      const success = await EmailService.sendNewChatMessageEmail(email, nome, senderName, chatContext);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de notificação de mensagem no chat enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPetitionAssigned = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const success = await EmailService.sendPetitionAssignedEmail(email, nome, petitionId, petitionTitle, deadline);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de atribuição de petição enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPetitionApproved = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const clientName = 'Dr. João Silva';
      const success = await EmailService.sendPetitionApprovedEmail(email, nome, petitionId, petitionTitle, clientName);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de petição aprovada enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestWriterAcceptedPetition = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const petitionValue = 'R$ 500,00';
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const clientName = 'Dr. João Silva';
      const success = await EmailService.sendWriterAcceptedPetitionEmail(email, nome, petitionId, petitionTitle, petitionValue, deadline, clientName);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de confirmação de aceitação de petição enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAvailablePetitions = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionsCount = 5;
      const success = await EmailService.sendAvailablePetitionsEmail(email, nome, petitionsCount);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de petições disponíveis enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestClientPetitionAccepted = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const writerName = 'Maria Oliveira';
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const success = await EmailService.sendClientPetitionAcceptedEmail(email, nome, petitionId, petitionTitle, writerName, deadline);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de aceite de petição (cliente) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestClientPetitionReturnedFromRevision = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const writerName = 'Maria Oliveira';
      const success = await EmailService.sendClientPetitionReturnedFromRevisionEmail(email, nome, petitionId, petitionTitle, writerName);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de retorno de correção (cliente) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestClientPetitionReturnedFromProofreading = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const petitionId = 'PET-2025-001';
      const petitionTitle = 'Ação de Cobrança - João da Silva vs. Empresa XYZ';
      const success = await EmailService.sendClientPetitionReturnedFromProofreadingEmail(email, nome, petitionId, petitionTitle);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de retorno do corretor (cliente) enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPasswordReset = async () => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const resetLink = `${import.meta.env.VITE_APP_URL || 'http://localhost:5176'}/#/reset-password?token=exemplo123`;
      const success = await EmailService.sendPasswordResetEmail(email, nome, resetLink);
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de redefinição de senha enviado! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestSimple = async () => {
    if (!email) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha o email!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const success = await EmailService.sendEmail({
        to: email,
        subject: '🧪 Teste do Resend - Veredicta',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ea580c;">🎉 Teste Bem-sucedido!</h1>
            <p>Se você está vendo este email, significa que a integração com o Resend está funcionando perfeitamente!</p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <strong>✅ Sistema de emails configurado com sucesso!</strong>
            </div>
            <p>Próximos passos:</p>
            <ul>
              <li>Integrar nos fluxos de registro</li>
              <li>Adicionar notificações de petições</li>
              <li>Personalizar templates</li>
            </ul>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Enviado por Veredicta - Plataforma de Petições Jurídicas
            </p>
          </div>
        `
      });
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de teste enviado com sucesso! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestEmailConfirmation = async () => {
    if (!email) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha o email!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const confirmationUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5176'}/#/confirm-email?token=exemplo456`;
      const success = await EmailService.sendEmailConfirmation(email, confirmationUrl);

      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: '✅ Email de confirmação enviado! Verifique sua caixa de entrada.' 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const getPlanDetails = (planName: 'Free' | 'Start' | 'Pro' | 'Elite') => {
    const planDetailsMap = {
        Free: {
          petitionsLimit: 1,
          features: [
            '1 petição gratuita',
            'Entrega em 3-5 dias úteis',
            '1 revisão gratuita',
            'Consulta com redator e chat incluso',
            'Validade: 7 dias',
            'Confidencialidade garantida (NDA)'
          ]
        },
        Start: {
          petitionsLimit: 4,
          features: [
            '4 petições incluídas',
            'Até 3 dias úteis por entrega',
            '1 revisão gratuita no pacote',
            'Consulta com redator e chat incluso',
            'Validade: 30 dias',
            'Confidencialidade garantida (NDA)',
            'Valor por petição: R$ 130,00'
          ]
        },
        Pro: {
          petitionsLimit: 14,
          features: [
            '14 petições incluídas',
            'Entregas em até 2 dias úteis',
            '1 revisão gratuita por petição',
            'Consulta com redator e chat incluso',
            '+1 petição bônus na renovação',
            'Validade: 60 dias',
            'Confidencialidade garantida (NDA)',
            'Valor por petição: R$ 120,00',
            'Economia de R$ 10,00 por petição'
          ]
        },
        Elite: {
          petitionsLimit: 70,
          features: [
            '70 petições incluídas',
            'Entrega em até 1 dia útil (prioridade máxima)',
            '1 revisão gratuita por petição',
            'Revisão extra por advogado sênior (opcional)',
            'Consulta direta com redator via plataforma',
            '+3 petições bônus na renovação',
            'Acesso antecipado a novos recursos',
            'Validade: 90 dias',
            'Confidencialidade garantida (NDA)',
            'Valor por petição: R$ 100,00'
          ]
        }
      };
    
    return planDetailsMap[planName];
  };

  const handleTestPlanSubscription = async (planName: 'Free' | 'Start' | 'Pro' | 'Elite') => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const success = await EmailService.sendPlanSubscriptionEmail(
        email,
        nome,
        planName,
        getPlanDetails(planName)
      );
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: `✅ Email de plano ${planName} enviado com sucesso! Verifique sua caixa de entrada.` 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPlanRenewalOrChange = async (
    newPlan: 'Free' | 'Start' | 'Pro' | 'Elite',
    oldPlan?: 'Free' | 'Start' | 'Pro' | 'Elite'
  ) => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const success = await EmailService.sendPlanRenewalOrChangeEmail(
        email,
        nome,
        newPlan,
        getPlanDetails(newPlan),
        oldPlan
      );
      
      if (success) {
        const action = oldPlan === newPlan ? 'Renovação' : oldPlan ? 'Troca' : 'Ativação';
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: `✅ Email de ${action.toLowerCase()} de plano enviado com sucesso! Verifique sua caixa de entrada.` 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPlanLimitWarning = async (planName: 'Start' | 'Pro' | 'Elite') => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const planLimits = {
        Start: 4,
        Pro: 14,
        Elite: 70
      };
      
      const totalPetitions = planLimits[planName];
      const remainingPetitions = 1; // Teste com 1 petição restante
      
      const success = await EmailService.sendPlanLimitWarningEmail(
        email,
        nome,
        planName,
        remainingPetitions,
        totalPetitions
      );
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: `✅ Email de aviso de limite (${planName}) enviado com sucesso! Verifique sua caixa de entrada.` 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestPlanCancellation = async (planName: 'Start' | 'Pro' | 'Elite') => {
    if (!email || !nome) {
      setResultado({ tipo: 'erro', mensagem: 'Preencha email e nome!' });
      return;
    }

    setSending(true);
    setResultado(null);
    
    try {
      const unusedPetitions = 2; // Teste com 2 petições não utilizadas
      const cancellationDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const success = await EmailService.sendPlanCancellationEmail(
        email,
        nome,
        planName,
        unusedPetitions,
        cancellationDate
      );
      
      if (success) {
        setResultado({ 
          tipo: 'sucesso', 
          mensagem: `✅ Email de cancelamento (${planName}) enviado com sucesso! Verifique sua caixa de entrada.` 
        });
      } else {
        setResultado({ 
          tipo: 'erro', 
          mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
        });
      }
    } catch (error) {
      setResultado({ 
        tipo: 'erro', 
        mensagem: '❌ Erro ao enviar email. Verifique o console (F12) para mais detalhes.' 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">Teste de Email - Resend</h1>
          <p className="text-muted-foreground">Teste a integração do sistema de emails</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📧 Teste de Envio</CardTitle>
          <CardDescription>
            Preencha os dados abaixo e clique em um dos botões para testar o envio de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email de Destino</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Use seu email pessoal para receber o teste
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome (opcional para alguns testes)</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleTestSimple}
              disabled={sending || !email}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Teste Simples
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestWelcome}
              disabled={sending || !email || !nome}
              variant="outline"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🎁 Boas-vindas (Cliente)
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestWriterWelcome}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-green-300 hover:bg-green-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  ✍️ Boas-vindas (Redator)
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestWriterRejection}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-red-300 hover:bg-red-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  ❌ Não Aprovado (Redator)
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestWriterSuspension}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-red-300 hover:bg-red-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🔒 Suspensão (Redator)
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestWriterBlock}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-red-600 hover:bg-red-100"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🚫 Bloqueio (Redator)
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestRevisionRequest}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-yellow-300 hover:bg-yellow-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  ✏️ Pedido de Correção
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestInvoiceReminder}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-blue-300 hover:bg-blue-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🧾 Lembrete: Nota Fiscal
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestNewChatMessage}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-purple-300 hover:bg-purple-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  💬 Nova Mensagem no Chat
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestPetitionAssigned}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-indigo-300 hover:bg-indigo-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  📋 Petição Atribuída
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestPetitionApproved}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-green-300 hover:bg-green-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🎉 Petição Aprovada
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestWriterAcceptedPetition}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-cyan-300 hover:bg-cyan-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  ✅ Redator Aceitou Petição
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestAvailablePetitions}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-amber-300 hover:bg-amber-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  📢 Petições Disponíveis
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestClientPetitionAccepted}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-emerald-300 hover:bg-emerald-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  👨‍⚖️ Cliente: Petição Aceita
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestClientPetitionReturnedFromRevision}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-teal-300 hover:bg-teal-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  ✏️ Cliente: Correções Finalizadas
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestClientPetitionReturnedFromProofreading}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-sky-300 hover:bg-sky-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🔍 Cliente: Revisão Finalizada
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestPasswordReset}
              disabled={sending || !email || !nome}
              variant="outline"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  🔐 Reset de Senha
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestEmailConfirmation}
              disabled={sending || !email}
              variant="outline"
              className="border-orange-300 hover:bg-orange-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  ✉️ Confirmar Email
                </>
              )}
            </Button>

            <Button 
              onClick={() => handleTestPlanSubscription('Free')}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  📦 Plano Free
                </>
              )}
            </Button>

            <Button 
              onClick={() => handleTestPlanSubscription('Start')}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-blue-300 hover:bg-blue-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  📦 Plano Start
                </>
              )}
            </Button>

            <Button 
              onClick={() => handleTestPlanSubscription('Pro')}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-purple-300 hover:bg-purple-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  📦 Plano Pro
                </>
              )}
            </Button>

            <Button 
              onClick={() => handleTestPlanSubscription('Elite')}
              disabled={sending || !email || !nome}
              variant="outline"
              className="border-amber-400 hover:bg-amber-50"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  📦 Plano Elite
                </>
              )}
            </Button>

          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">🔄 Renovações de Planos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => handleTestPlanRenewalOrChange('Start', 'Start')} disabled={sending || !email || !nome} variant="outline" className="border-blue-300">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>🔄 Start</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Pro', 'Pro')} disabled={sending || !email || !nome} variant="outline" className="border-purple-300">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>🔄 Pro</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Elite', 'Elite')} disabled={sending || !email || !nome} variant="outline" className="border-amber-300">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>🔄 Elite</>}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">⬆️ Upgrades de Planos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => handleTestPlanRenewalOrChange('Start', 'Free')} disabled={sending || !email || !nome} variant="outline" className="border-green-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬆️ Free→Start</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Pro', 'Free')} disabled={sending || !email || !nome} variant="outline" className="border-green-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬆️ Free→Pro</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Elite', 'Free')} disabled={sending || !email || !nome} variant="outline" className="border-green-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬆️ Free→Elite</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Pro', 'Start')} disabled={sending || !email || !nome} variant="outline" className="border-green-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬆️ Start→Pro</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Elite', 'Start')} disabled={sending || !email || !nome} variant="outline" className="border-green-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬆️ Start→Elite</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Elite', 'Pro')} disabled={sending || !email || !nome} variant="outline" className="border-green-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬆️ Pro→Elite</>}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">⬇️ Downgrades de Planos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => handleTestPlanRenewalOrChange('Start', 'Pro')} disabled={sending || !email || !nome} variant="outline" className="border-orange-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬇️ Pro→Start</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Start', 'Elite')} disabled={sending || !email || !nome} variant="outline" className="border-orange-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬇️ Elite→Start</>}
              </Button>
              <Button onClick={() => handleTestPlanRenewalOrChange('Pro', 'Elite')} disabled={sending || !email || !nome} variant="outline" className="border-orange-400">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⬇️ Elite→Pro</>}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">⚠️ Avisos de Limite de Petições</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => handleTestPlanLimitWarning('Start')} disabled={sending || !email || !nome} variant="outline" className="border-yellow-400 hover:bg-yellow-50">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⚠️ Limite Start</>}
              </Button>
              <Button onClick={() => handleTestPlanLimitWarning('Pro')} disabled={sending || !email || !nome} variant="outline" className="border-yellow-400 hover:bg-yellow-50">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⚠️ Limite Pro</>}
              </Button>
              <Button onClick={() => handleTestPlanLimitWarning('Elite')} disabled={sending || !email || !nome} variant="outline" className="border-yellow-400 hover:bg-yellow-50">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>⚠️ Limite Elite</>}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">❌ Cancelamento de Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => handleTestPlanCancellation('Start')} disabled={sending || !email || !nome} variant="outline" className="border-red-400 hover:bg-red-50">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>❌ Cancelamento Start</>}
              </Button>
              <Button onClick={() => handleTestPlanCancellation('Pro')} disabled={sending || !email || !nome} variant="outline" className="border-red-400 hover:bg-red-50">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>❌ Cancelamento Pro</>}
              </Button>
              <Button onClick={() => handleTestPlanCancellation('Elite')} disabled={sending || !email || !nome} variant="outline" className="border-red-400 hover:bg-red-50">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : <>❌ Cancelamento Elite</>}
              </Button>
            </div>
          </div>

          {resultado && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              resultado.tipo === 'sucesso' 
                ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
            }`}>
              {resultado.tipo === 'sucesso' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <p className={resultado.tipo === 'sucesso' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {resultado.mensagem}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <p>
              <strong>API Key configurada:</strong> ✅ Sim (keys.local.ts)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <p>
              <strong>Limite gratuito:</strong> 100 emails por dia (3.000/mês)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <p>
              <strong>Templates disponíveis:</strong> 
              <br />
              🎁 Boas-vindas (Cliente + Petição Grátis) | ✍️ Boas-vindas (Redator) | ❌ Não Aprovado (Redator) | 🔒 Suspensão (Redator) | 🚫 Bloqueio (Redator) | ✏️ Pedido de Correção | 🧾 Lembrete: Nota Fiscal | 💬 Nova Mensagem no Chat | 📋 Petição Atribuída | 🎉 Petição Aprovada | ✅ Redator Aceitou Petição | 📢 Petições Disponíveis | 👨‍⚖️ Cliente: Petição Aceita | ✏️ Cliente: Correções Finalizadas | 🔍 Cliente: Revisão Finalizada | 📦 Planos (Free/Start/Pro/Elite) | 🔄 Renovação/Upgrade/Downgrade | ⚠️ Aviso de Limite de Petições | ❌ Cancelamento de Plano | 📄 Nova Petição | ✅ Petição Concluída | 🔐 Reset de Senha | ✉️ Confirmação de Email
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600">•</span>
            <p>
              <strong>Próximo passo:</strong> Integrar nos fluxos de registro e petições
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
          ⚠️ Lembrete Importante
        </h3>
        <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
          <li>• Nunca commite o arquivo <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">keys.local.ts</code></li>
          <li>• Verifique a caixa de spam se não receber o email</li>
          <li>• Abra o console (F12) para ver logs detalhados</li>
          <li>• Configure um domínio verificado no Resend para melhor deliverability</li>
        </ul>
      </div>
    </div>
  );
}

