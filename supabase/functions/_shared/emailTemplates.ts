/**
 * Templates de Email Compartilhados para Edge Functions do Supabase
 * 
 * Versão standalone sem dependências externas - configurações inline
 */

// Configurações inline (sem depender de emailConfig.ts)
const LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';
const EMAIL_TEXT_LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Black%20Brown%20Modern%20Creative%20Portfolio%20Presentation%20(3).png';

const COLORS = {
  primary: '#ea580c',      // Laranja principal
  primaryDark: '#c2410c',  // Laranja escuro
  secondary: '#f97316',    // Laranja secundário
  success: '#10b981',      // Verde
  danger: '#ef4444',       // Vermelho
  info: '#6366f1',         // Azul/Roxo
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
};

/**
 * Template base com header e footer personalizados
 */
function getBaseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Veredicta</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f3f4f6;
          }
          .email-wrapper {
            width: 100%;
            background-color: #f3f4f6;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
          }
          .header-title {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .content {
            padding: 40px 30px;
          }
          .footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
            font-size: 14px;
          }
          .footer-logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 15px;
            opacity: 0.8;
          }
          .button {
            display: inline-block;
            background: ${COLORS.primary};
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(234, 88, 12, 0.3);
            transition: all 0.3s ease;
          }
          .button:hover {
            background: ${COLORS.primaryDark};
            box-shadow: 0 4px 8px rgba(234, 88, 12, 0.4);
          }
          .alert-box {
            background: #fef2f2;
            border-left: 4px solid ${COLORS.danger};
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .success-box {
            background: #d1fae5;
            border-left: 4px solid ${COLORS.success};
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box {
            background: #fef3c7;
            border-left: 4px solid ${COLORS.secondary};
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px;
            }
            .content {
              padding: 30px 20px;
            }
            .header {
              padding: 30px 20px;
            }
            .header-title {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            ${content}
            
            <!-- Footer -->
            <div class="footer">
              <p style="margin: 20px 0 10px; font-size: 12px;">
                © ${new Date().getFullYear()} Veredicta. Todos os direitos reservados.
              </p>
              
              <p style="margin: 10px 0; font-size: 12px; color: #6b7280;">
                Você está recebendo este email porque tem uma conta na Veredicta.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Template de Notificação de Nova Mensagem no Chat
 */
export function newChatMessageEmailTemplate(
  recipientName: string,
  senderName: string,
  chatContext: string,
  appUrl: string
): string {
  const content = `
    <!-- Header -->
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <!-- Nome da empresa -->
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">💬 Nova Mensagem no Chat</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${recipientName}</strong>,
      </p>
      
      <p>
        Você recebeu uma nova mensagem no chat da <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>👤 Remetente:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>${senderName}</strong>
        </p>
        <p style="margin: 5px 0 0; font-size: 14px; color: #666;">
          ${chatContext}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/chat" class="button" style="color: white;">
          Acessar Chat
        </a>
      </div>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Responda rapidamente para manter uma boa comunicação com ${senderName}. 
          Mensagens respondidas em até 24 horas melhoram a experiência na plataforma!
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Mantenha suas notificações ativadas para não perder nenhuma mensagem importante.
      </p>
      
      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}

/**
 * Template de Suspensão de Redator
 */
export function writerSuspensionEmailTemplate(
  userName: string, 
  lateCount: number = 3,
  suspensionDays: number = 30
): string {
  const content = `
    <!-- Header -->
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <!-- Nome da empresa -->
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">Sobre sua Conta</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        Informamos que sua conta de redator na <strong>Veredicta - Plataforma de Petições Jurídicas</strong> foi <strong>suspensa temporariamente por ${suspensionDays} dias</strong>.
      </p>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ Motivo da Suspensão:</strong>
        <p style="margin: 10px 0 0;">
          Atraso na entrega de <strong>${lateCount} ${lateCount === 1 ? 'petição' : 'petições'}</strong>.
        </p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
          Período de suspensão: <strong>${suspensionDays} dias</strong>
        </p>
      </div>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🔒 O que isso significa:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Você não poderá receber novas petições enquanto sua conta estiver suspensa</li>
          <li>Petições já atribuídas permanecerão em seu painel</li>
          <li>Histórico de trabalhos será preservado</li>
          <li>Acesso à plataforma será restrito</li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Próximos Passos:</strong>
        <p style="margin: 10px 0 0;">
          Para solicitar a revisão da suspensão ou esclarecer dúvidas, entre em contato conosco pelo email 
          <a href="mailto:contato@veredictajus.com" style="color: ${COLORS.primary};">contato@veredictajus.com</a> 
          o mais breve possível. Nossa equipe analisará seu caso e entrará em contato.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Estamos à disposição para esclarecer qualquer dúvida e trabalhar juntos para resolver esta situação.
      </p>
      
      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}

/**
 * Template de Lembrete de Nota Fiscal
 */
export function invoiceReminderEmailTemplate(writerName: string, month: string, appUrl: string): string {
  const content = `
    <!-- Header -->
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <!-- Nome da empresa -->
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">🧾 Lembrete: Nota Fiscal</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${writerName}</strong>,
      </p>
      
      <p>
        Este é um lembrete importante sobre o envio da sua <strong>Nota Fiscal</strong> referente ao mês de <strong>${month}</strong>.
      </p>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ Prazo Importante:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          A nota fiscal deve ser anexada na plataforma até o dia <strong>05 de cada mês</strong>.
        </p>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💰 Pagamento:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li><strong>Apenas redatores que anexarem a nota fiscal receberão o pagamento</strong></li>
          <li>O pagamento será processado após a validação da NF</li>
          <li>Notas fiscais enviadas após o dia 05 serão consideradas no mês seguinte</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/writer/payments" class="button" style="color: white;">
          Anexar Nota Fiscal
        </a>
      </div>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Como Anexar:</strong>
        <ol style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
          <li>Acesse a plataforma e vá até a seção "Pagamentos"</li>
          <li>Clique em "Anexar Nota Fiscal"</li>
          <li>Faça upload do arquivo (PDF, JPG ou PNG)</li>
          <li>Confirme o envio</li>
        </ol>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre como emitir ou anexar a nota fiscal, entre em contato conosco pelo email 
        <a href="mailto:contato@veredictajus.com" style="color: ${COLORS.primary};">contato@veredictajus.com</a>
      </p>
      
      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}

/**
 * Template de Atribuição de Petição ao Redator
 */
export function petitionAssignedEmailTemplate(
  writerName: string,
  petitionId: string,
  petitionTitle: string,
  deadline?: string,
  appUrl: string = 'http://localhost:5176'
): string {
  const deadlineText = deadline 
    ? `<div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⏰ Prazo de Entrega:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>${deadline}</strong>
        </p>
        <p style="margin: 5px 0 0; font-size: 14px; color: #666;">
          Certifique-se de entregar a petição dentro do prazo estabelecido.
        </p>
      </div>`
    : '';

  const content = `
    <!-- Header -->
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <!-- Nome da empresa -->
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">📋 Nova Petição Atribuída</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${writerName}</strong>,
      </p>
      
      <p>
        Uma nova petição foi atribuída a você na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📄 Detalhes da Petição:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>ID:</strong> ${petitionId}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Título:</strong> ${petitionTitle}
        </p>
      </div>
      
      ${deadlineText}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/writer/my-petitions?petition=${petitionId}" class="button" style="color: white;">
          Ver Petição
        </a>
      </div>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Lembrete:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Revise todos os documentos anexados pelo cliente</li>
          <li>Entre em contato caso tenha dúvidas sobre a petição</li>
          <li>Mantenha o cliente informado sobre o progresso do trabalho</li>
          <li>Entregue a petição dentro do prazo estabelecido</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre a petição ou precisar de suporte, entre em contato conosco:
        <a href="mailto:contato@veredictajus.com" style="color: ${COLORS.primary};">contato@veredictajus.com</a>
      </p>
      
      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}

/**
 * Template de Notificação de Petições Disponíveis (Redator)
 */
export function availablePetitionsEmailTemplate(
  writerName: string,
  petitionsCount: number,
  appUrl: string = 'http://localhost:5176'
): string {
  const petitionsText = petitionsCount === 1 
    ? 'há <strong>1 nova petição</strong> disponível' 
    : `há <strong>${petitionsCount} novas petições</strong> disponíveis`;

  const content = `
    <!-- Header -->
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <!-- Nome da empresa -->
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">📋 Novas Petições Disponíveis</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${writerName}</strong>,
      </p>
      
      <p>
        Temos boas notícias! No momento, ${petitionsText} para você na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💼 Novas Oportunidades!</strong>
        <p style="margin: 10px 0 0;">
          Clientes estão aguardando redatores qualificados para desenvolver suas petições. 
          Esta é sua chance de conquistar novos trabalhos!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/writer/available" class="button" style="color: white;">
          Ver Petições Disponíveis
        </a>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Como Funciona:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Acesse a plataforma e visualize as petições disponíveis</li>
          <li>Analise os detalhes: título, valor, prazo e requisitos</li>
          <li>Aceite as petições que se encaixam no seu perfil</li>
          <li>Comece a trabalhar imediatamente após a aceitação</li>
        </ul>
      </div>
      
      <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⏰ Atenção:</strong>
        <p style="margin: 10px 0 0;">
          As petições são atribuídas por ordem de aceitação. 
          Quanto mais rápido você aceitar, maior a chance de garantir o trabalho!
        </p>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🌟 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Redatores que respondem rapidamente e entregam com qualidade 
          têm prioridade e conquistam mais clientes na plataforma!
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Não perca essa oportunidade de aumentar seus ganhos. Acesse agora mesmo!
      </p>
      
      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}

/**
 * Template de Petição Concluída Personalizado
 */
export function petitionCompletedEmailTemplate(
  userName: string,
  petitionTitle: string,
  appUrl: string
): string {
  const content = `
    <!-- Header -->
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <!-- Nome da empresa -->
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">✅ Petição Concluída!</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p style="font-size: 18px; color: ${COLORS.success}; font-weight: 600;">
        🎉 Ótimas notícias!
      </p>
      
      <p>
        Sua petição foi concluída e está pronta para sua revisão!
      </p>
      
      <div class="success-box">
        <strong style="color: ${COLORS.success};">✅ Petição Finalizada</strong>
        <h3 style="margin: 15px 0 5px; color: #333;">${petitionTitle}</h3>
      </div>
      
      <h3 style="color: ${COLORS.primary}; margin-top: 30px;">📋 Próximas Ações:</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Revisar o Documento:</strong> Acesse a plataforma e revise o trabalho</li>
        <li><strong>Solicitar Ajustes:</strong> Se necessário, peça correções pelo chat</li>
        <li><strong>Aprovar a Petição:</strong> Quando estiver satisfeito, aprove o documento</li>
        <li><strong>Baixar Arquivos:</strong> Após aprovação, baixe os arquivos finais</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/petitions" class="button">
          📄 Revisar Petição
        </a>
      </div>
      
      <div class="info-box">
        <strong>⭐ Avaliação:</strong>
        <p style="margin: 10px 0 0;">
          Após aprovar, não esqueça de avaliar o trabalho do redator!
          Isso nos ajuda a manter a qualidade do serviço.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}









