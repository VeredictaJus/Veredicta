/**
 * Templates de Email Personalizados para Veredicta
 * 
 * Como usar imagens:
 * - Para o logo, use uma URL pública hospedada
 * - Ou converta para base64 (para pequenas imagens)
 * - Ou hospede no Supabase Storage e use URL pública
 */

import { EMAIL_LOGO_URL, EMAIL_TEXT_LOGO_URL, EMAIL_COLORS, getVeredictaText } from './emailConfig';

// Usar configurações importadas do emailConfig.ts
const LOGO_URL = EMAIL_LOGO_URL;

// Cores da marca Veredicta
const COLORS = EMAIL_COLORS;

/**
 * Template base com header e footer personalizados
 */
export function getBaseTemplate(content: string): string {
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
          .social-links {
            margin: 20px 0;
          }
          .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #9ca3af;
            text-decoration: none;
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
 * Template de Boas-Vindas Personalizado
 */
export function welcomeEmailTemplate(userName: string, appUrl: string): string {
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">🎉 Bem-vindo!</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        É um imenso prazer tê-lo(a) conosco! Sua conta foi criada com sucesso na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>, 
        a plataforma que conecta advogados a redatores jurídicos especializados.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ Conta Ativada com Sucesso!</strong>
        <p style="margin: 10px 0 0;">Você já pode começar a usar todos os recursos da plataforma.</p>
      </div>
      
      <div class="success-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
        <h3 style="color: ${COLORS.primary}; margin: 0 0 10px 0; font-size: 20px;">🎁 Bônus de Boas-Vindas</h3>
        <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold; color: ${COLORS.success};">
          Você Ganhou 1 Petição Grátis!
        </p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
          Como bônus de boas-vindas, sua primeira petição é totalmente grátis. 
          Experimente nossos serviços sem compromisso!
        </p>
      </div>
      
      <h3 style="color: ${COLORS.primary}; margin-top: 30px;">🚀 Próximos Passos:</h3>
      <ul style="line-height: 1.8;">
        <li>Complete seu perfil nas configurações</li>
        <li>Explore os planos disponíveis</li>
        <li>Crie sua primeira petição grátis</li>
        <li>Conheça nosso sistema de chat integrado</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/new-petition" class="button" style="color: white;">
          Criar Minha Petição Grátis
        </a>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Mantenha suas notificações ativadas para receber atualizações importantes sobre suas petições! 
          A primeira petição é grátis, então aproveite para conhecer a qualidade dos nossos redatores.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver qualquer dúvida, nossa equipe de suporte está à disposição pelo chat ou email 
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
 * Template de Boas-Vindas para Redatores
 */
export function writerWelcomeEmailTemplate(userName: string, appUrl: string): string {
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">🎉 Bem-vindo à Equipe!</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        Temos o prazer de informar que suas credenciais foram <strong>aprovadas</strong> e você agora faz parte da equipe de redatores da <strong>Veredicta - Plataforma de Petições Jurídicas</strong>!
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ Cadastro Aprovado com Sucesso!</strong>
        <p style="margin: 10px 0 0;">Você já pode começar a receber e redigir petições.</p>
      </div>
      
      <h3 style="color: ${COLORS.primary}; margin-top: 30px;">📋 Como Funciona:</h3>
      <ul style="line-height: 1.8;">
        <li>Você receberá notificações quando novas petições forem atribuídas a você</li>
        <li>Acesse a plataforma para visualizar detalhes e prazos</li>
        <li>Redija as petições diretamente no sistema</li>
        <li>Acompanhe seus ganhos e histórico de trabalhos</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/writer" class="button" style="color: white;">
          Acessar Plataforma
        </a>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Mantenha suas notificações ativadas para não perder nenhuma oportunidade de trabalho!
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver qualquer dúvida sobre o funcionamento da plataforma, nossa equipe de suporte está à disposição pelo chat ou email 
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
 * Template de Cadastro Não Aprovado para Redatores
 */
export function writerRejectionEmailTemplate(userName: string): string {
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">Sobre seu Cadastro</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        Agradecemos seu interesse em fazer parte da equipe de redatores da <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <p>
        Após análise cuidadosa de sua candidatura, informamos que, <strong>neste momento</strong>, seu cadastro não foi aprovado para integrar nossa rede de redatores.
      </p>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📅 Nova Oportunidade</strong>
        <p style="margin: 10px 0 0;">
          Você poderá submeter uma nova candidatura daqui a <strong>30 dias</strong>. Enquanto isso, sugerimos:
        </p>
      </div>
      
      <h3 style="color: ${COLORS.primary}; margin-top: 30px;">💡 Sugestões para Melhorar suas Petições:</h3>
      <ul style="line-height: 1.8;">
        <li>Aprimore a clareza e objetividade na argumentação jurídica</li>
        <li>Fortaleça a fundamentação legal com jurisprudências e legislação atualizada</li>
        <li>Melhore a estrutura e formatação técnica das petições</li>
        <li>Refine a linguagem jurídica formal e a coesão textual</li>
      </ul>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ Importante:</strong>
        <p style="margin: 10px 0 0;">
          Esta decisão não é definitiva. Encorajamos você a se preparar e tentar novamente no futuro. 
          Valorizamos seu interesse em contribuir com a justiça brasileira!
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre o processo de seleção ou quiser feedback adicional, entre em contato conosco pelo email 
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
 * Template de Bloqueio Permanente de Redator
 */
export function writerBlockEmailTemplate(userName: string, lateCount: number = 9): string {
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">Bloqueio de Conta</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        Informamos que sua conta de redator na <strong>Veredicta - Plataforma de Petições Jurídicas</strong> foi <strong>bloqueada permanentemente</strong>.
      </p>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ Motivo do Bloqueio:</strong>
        <p style="margin: 10px 0 0;">
          Atraso reiterado na entrega de <strong>${lateCount} petições</strong>.
        </p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
          Esta medida foi tomada após múltiplas advertências e suspensões prévias.
        </p>
      </div>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🔒 Consequências do Bloqueio:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Acesso à plataforma será <strong>permanentemente revogado</strong></li>
          <li>Não será possível receber novas petições</li>
          <li>Petições em andamento serão reatribuídas a outros redatores</li>
          <li>Histórico de trabalhos será preservado para fins administrativos</li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Recurso:</strong>
        <p style="margin: 10px 0 0;">
          Caso deseje contestar esta decisão ou apresentar justificativas, você tem até <strong>7 dias</strong> para entrar em contato conosco pelo email 
          <a href="mailto:contato@veredictajus.com" style="color: ${COLORS.primary};">contato@veredictajus.com</a>
        </p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #666;">
          Nossa equipe avaliará seu caso individualmente.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Lamentamos que nossa parceria tenha chegado a este ponto. Agradecemos pelos serviços prestados até o momento.
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
 * Template de Pedido de Correção (Cliente solicitou correções ao Redator)
 */
export function revisionRequestEmailTemplate(
  writerName: string,
  petitionId: string,
  petitionTitle: string,
  revisionNotes: string,
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">📝 Pedido de Correção</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${writerName}</strong>,
      </p>
      
      <p>
        O cliente solicitou correções na petição que você redigiu. Por favor, revise os apontamentos abaixo e faça as alterações necessárias.
      </p>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Detalhes da Petição:</strong>
        <h3 style="margin: 15px 0 5px; color: #333;">${petitionTitle}</h3>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">
          ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${petitionId}</code>
        </p>
      </div>
      
      <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✏️ Observações do Cliente:</strong>
        <div style="margin: 15px 0 0; padding: 15px; background: #ffffff; border-radius: 6px; border: 1px solid #fee2e2;">
          <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${revisionNotes}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/writer/my-petitions?petition=${petitionId}" class="button" style="color: white;">
          Acessar Petição
        </a>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⏰ Prazo:</strong>
        <p style="margin: 10px 0 0;">
          Por favor, faça as correções solicitadas o mais breve possível. O cliente está aguardando a nova versão da petição.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre as correções solicitadas, utilize o chat da plataforma para se comunicar diretamente com o cliente.
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
 * Template de Nova Petição Personalizado
 */
export function newPetitionEmailTemplate(
  userName: string, 
  petitionTitle: string,
  petitionId: string,
  appUrl: string,
  deadline?: string
): string {
  const deadlineBlock = deadline
    ? `
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⏰ Prazo sugerido:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          ${deadline}
        </p>
      </div>
    `
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">📄 Nova Petição Criada</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        Sua petição foi criada com sucesso e já está em nosso sistema!
      </p>
      
      <div class="success-box">
        <strong style="color: ${COLORS.success};">✅ Petição Registrada</strong>
        <h3 style="margin: 15px 0 5px; color: #333;">${petitionTitle}</h3>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">
          ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${petitionId}</code>
        </p>
      </div>

      ${deadlineBlock}
      
      <h3 style="color: ${COLORS.primary}; margin-top: 30px;">📋 O que acontece agora?</h3>
      <ol style="line-height: 1.8;">
        <li><strong>Análise da Petição:</strong> Nossa equipe está analisando sua solicitação</li>
        <li><strong>Atribuição ao Redator:</strong> Em breve um redator especializado será atribuído</li>
        <li><strong>Desenvolvimento:</strong> O redator trabalhará na sua petição</li>
        <li><strong>Revisão:</strong> Você poderá revisar e aprovar o documento</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/petitions" class="button" style="color: white;">
          📊 Acompanhar Progresso
        </a>
      </div>
      
      <div class="info-box">
        <strong>💬 Fique por dentro!</strong>
        <p style="margin: 10px 0 0;">
          Você receberá notificações por email a cada atualização. 
          Acompanhe também pelo chat integrado da plataforma.
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

/**
 * Template de Reset de Senha Personalizado
 */
export function passwordResetEmailTemplate(
  userName: string,
  resetLink: string
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">Redefinir Senha</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p>
        Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <p>
        Clique no botão abaixo para criar uma nova senha:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button" style="background: ${COLORS.primary}; color: white;">
          Redefinir Minha Senha
        </a>
      </div>
      
      <div class="alert-box">
        <strong>⚠️ Importante:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Este link expira em <strong>1 hora</strong></li>
          <li>Só funciona uma única vez</li>
          <li>Se você não solicitou esta redefinição, ignore este email</li>
        </ul>
      </div>
      
      <div class="info-box">
        <strong>🔒 Segurança:</strong>
        <p style="margin: 10px 0 0;">
          Nunca compartilhe este link com outras pessoas. 
          Nossa equipe nunca pedirá sua senha por email.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas, entre em contato:
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
 * Template de Convite Concierge (definição de senha / primeiro acesso)
 */
export function conciergeInviteEmailTemplate(
  userName: string,
  setPasswordLink: string
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">Acesso Concierge</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 14px;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <p style="margin-top: 0;">
        Seu <strong>Acesso Concierge</strong> à Veredicta está pronto.
        Para começar, basta definir sua senha:
      </p>
      
      <div style="text-align: center; margin: 26px 0;">
        <a href="${setPasswordLink}" class="button" style="background: ${COLORS.primary}; color: white;">
          Definir senha e acessar
        </a>
      </div>
      
      <div class="info-box" style="background: #fff7ed; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>Como funciona</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
          <li>Defina sua senha e faça login</li>
          <li>Crie sua petição com suas informações e documentos</li>
          <li>Receba a entrega e aprove quando estiver tudo ok</li>
        </ul>
      </div>
      
      <div class="alert-box">
        <strong>⚠️ Importante:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Este link expira em <strong>1 hora</strong></li>
          <li>Se você não reconhece este convite, ignore este email</li>
        </ul>
      </div>
      
      <p style="margin-top: 26px;">
        Suporte: <a href="mailto:contato@veredictajus.com" style="color: ${COLORS.primary};">contato@veredictajus.com</a>
      </p>
      
      <p style="margin-top: 26px;">
        Atenciosamente,<br />
        <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
}

/**
 * Template de Notificação Genérica
 */
export function notificationEmailTemplate(
  userName: string,
  title: string,
  message: string,
  buttonText?: string,
  buttonUrl?: string
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">${title}</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0;">
        Olá <strong style="color: ${COLORS.primary}">${userName}</strong>,
      </p>
      
      <div style="margin: 20px 0;">
        ${message}
      </div>
      
      ${buttonText && buttonUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${buttonUrl}" class="button">
            ${buttonText}
          </a>
        </div>
      ` : ''}
      
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
 * Template de Petição Aprovada pelo Cliente
 */
export function petitionApprovedEmailTemplate(
  writerName: string,
  petitionId: string,
  petitionTitle: string,
  clientName?: string,
  appUrl: string = 'http://localhost:5176'
): string {
  const clientText = clientName 
    ? `<p style="margin: 10px 0 0; font-size: 14px; color: #666;">
        Cliente: <strong>${clientName}</strong>
      </p>`
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">🎉 Petição Aprovada</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${writerName}</strong>,
      </p>
      
      <p>
        Temos uma ótima notícia! Sua petição foi <strong>aprovada pelo cliente</strong> na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ Trabalho Concluído com Sucesso!</strong>
        <p style="margin: 10px 0 0;">
          O cliente ficou satisfeito com a qualidade da petição e aprovou o trabalho final.
        </p>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📄 Detalhes da Petição:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>ID:</strong> ${petitionId}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Título:</strong> ${petitionTitle}
        </p>
        ${clientText}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/petitions?petition=${petitionId}" class="button" style="color: white;">
          Ver Petição Revisada
        </a>
      </div>
      
      <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💰 Sobre o Pagamento:</strong>
        <p style="margin: 10px 0 0;">
          O valor referente a esta petição será incluído no seu saldo. 
          Não esqueça de anexar sua nota fiscal até o dia <strong>05</strong> do mês para receber o pagamento.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Parabéns pelo excelente trabalho! Continue mantendo a qualidade para conquistar cada vez mais clientes.
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
 * Template de Confirmação de Aceitação de Petição (Redator)
 */
export function writerAcceptedPetitionEmailTemplate(
  writerName: string,
  petitionId: string,
  petitionTitle: string,
  petitionValue: string,
  deadline: string,
  clientName?: string,
  appUrl: string = 'http://localhost:5176'
): string {
  const clientText = clientName 
    ? `<p style="margin: 10px 0 0; font-size: 16px;">
        <strong>Cliente:</strong> ${clientName}
      </p>`
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">✅ Petição Aceita</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${writerName}</strong>,
      </p>
      
      <p>
        Você aceitou com sucesso uma nova petição na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🎯 Compromisso Confirmado!</strong>
        <p style="margin: 10px 0 0;">
          Sua aceitação foi registrada. Agora você pode começar a trabalhar na petição.
        </p>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📄 Detalhes da Petição:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>ID:</strong> ${petitionId}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Título:</strong> ${petitionTitle}
        </p>
        ${clientText}
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Valor:</strong> <span style="color: ${COLORS.success}; font-weight: bold;">${petitionValue}</span>
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Prazo de Entrega:</strong> <span style="color: ${COLORS.secondary}; font-weight: bold;">${deadline}</span>
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/writer/my-petitions?petition=${petitionId}" class="button" style="color: white;">
          Acessar Petição
        </a>
      </div>
      
      <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ Importante:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Revise todos os documentos anexados pelo cliente</li>
          <li>Entre em contato em caso de dúvidas sobre os requisitos</li>
          <li>Mantenha o cliente informado sobre o progresso</li>
          <li><strong>Entregue dentro do prazo estabelecido</strong></li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica Profissional:</strong>
        <p style="margin: 10px 0 0;">
          Petições entregues com antecedência e qualidade aumentam sua reputação na plataforma 
          e ajudam a conquistar mais clientes no futuro!
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se precisar de suporte, entre em contato:
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
 * Template de Notificação de Aceitação de Petição pelo Redator (Cliente)
 */
export function clientPetitionAcceptedEmailTemplate(
  clientName: string,
  petitionId: string,
  petitionTitle: string,
  writerName: string,
  deadline: string,
  appUrl: string = 'http://localhost:5176'
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">✅ Petição Aceita por Redator</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        Ótimas notícias! Sua petição foi <strong>aceita por um redator qualificado</strong> na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🎯 Trabalho Iniciado!</strong>
        <p style="margin: 10px 0 0;">
          Um redator experiente está agora trabalhando na sua petição. 
          Você será notificado sobre o andamento do trabalho.
        </p>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📄 Detalhes da Petição:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>ID:</strong> ${petitionId}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Título:</strong> ${petitionTitle}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Redator:</strong> <span style="color: ${COLORS.primary}; font-weight: bold;">${writerName}</span>
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Prazo de Entrega:</strong> <span style="color: ${COLORS.secondary}; font-weight: bold;">${deadline}</span>
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/petitions?petition=${petitionId}" class="button" style="color: white;">
          Acompanhar Progresso
        </a>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Próximos Passos:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>O redator está analisando os documentos enviados</li>
          <li>Você pode acompanhar o status em tempo real na plataforma</li>
          <li>Use o chat para esclarecer dúvidas com o redator</li>
          <li>Você será notificado quando a petição estiver pronta para revisão</li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Mantenha-se disponível para responder dúvidas do redator através do chat. 
          Isso ajuda a garantir que a petição seja elaborada exatamente como você precisa!
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver alguma dúvida, entre em contato:
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
 * Template de Notificação de Retorno de Correção (Cliente)
 */
export function clientPetitionReturnedFromRevisionEmailTemplate(
  clientName: string,
  petitionId: string,
  petitionTitle: string,
  writerName: string,
  appUrl: string = 'http://localhost:5176'
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">✅ Correções Finalizadas</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        Ótimas notícias! O redator finalizou as <strong>correções solicitadas</strong> na sua petição na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ Pronto para Revisão!</strong>
        <p style="margin: 10px 0 0;">
          A petição foi atualizada de acordo com suas solicitações e está aguardando sua nova revisão.
        </p>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📄 Detalhes da Petição:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>ID:</strong> ${petitionId}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Título:</strong> ${petitionTitle}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Redator:</strong> <span style="color: ${COLORS.primary}; font-weight: bold;">${writerName}</span>
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/petitions?petition=${petitionId}" class="button" style="color: white;">
          Revisar Petição
        </a>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Próximas Ações:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Revise as alterações realizadas pelo redator</li>
          <li>Verifique se todas as suas solicitações foram atendidas</li>
          <li>Aprove a petição se estiver satisfeito</li>
          <li>Solicite novos ajustes caso necessário</li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Revise a petição com atenção e, caso tenha dúvidas sobre as alterações, 
          utilize o chat para conversar diretamente com o redator.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver alguma dúvida, entre em contato:
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
 * Template de Notificação de Retorno do Corretor (Cliente)
 */
export function clientPetitionReturnedFromProofreadingEmailTemplate(
  clientName: string,
  petitionId: string,
  petitionTitle: string,
  appUrl: string = 'http://localhost:5176'
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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">✅ Revisão Finalizada</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        Ótimas notícias! Nosso corretor finalizou a <strong>revisão profissional</strong> da sua petição na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ Revisão Concluída!</strong>
        <p style="margin: 10px 0 0;">
          A petição passou por uma revisão detalhada de ortografia, gramática e formatação. 
          Está pronta para sua análise final.
        </p>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📄 Detalhes da Petição:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>ID:</strong> ${petitionId}
        </p>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Título:</strong> ${petitionTitle}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/petitions?petition=${petitionId}" class="button" style="color: white;">
          Ver Petição Revisada
        </a>
      </div>
      
      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🔍 O que foi revisado:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Ortografia e gramática</li>
          <li>Estrutura e formatação do documento</li>
          <li>Coerência textual</li>
          <li>Padrões técnicos e normas jurídicas</li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📋 Próximos Passos:</strong>
        <p style="margin: 10px 0 0;">
          Revise a petição e, se estiver satisfeito com o resultado final, 
          aprove para concluir o processo. Caso identifique algum ponto que necessite ajuste, 
          entre em contato através do chat.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver alguma dúvida, entre em contato:
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
 * Template de Confirmação de Contratação de Plano (Cliente)
 */
export function planSubscriptionEmailTemplate(
  clientName: string,
  planName: 'Free' | 'Start' | 'Pro' | 'Elite',
  planDetails: {
    petitionsLimit: number;
    features: string[];
  },
  appUrl: string = 'http://localhost:5176'
): string {
  const planColors = {
    Free: '#6b7280',
    Start: '#3b82f6',
    Pro: '#8b5cf6',
    Elite: '#f59e0b'
  };

  const planColor = planColors[planName];
  
  const isPaidPlan = planName !== 'Free';

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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">${isPaidPlan ? '💳 Plano Contratado' : '🎉 Bem-vindo ao Plano Free'}</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        ${isPaidPlan 
          ? `Obrigado por contratar o <strong>Plano ${planName}</strong> na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>!` 
          : `Bem-vindo ao <strong>Plano ${planName}</strong> da <strong>Veredicta - Plataforma de Petições Jurídicas</strong>!`
        }
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ ${isPaidPlan ? 'Pagamento Confirmado!' : 'Plano Ativado!'}</strong>
        <p style="margin: 10px 0 0;">
          Seu plano já está ativo e você pode começar a usufruir de todos os benefícios imediatamente.
        </p>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid ${planColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: ${planColor}; margin: 0 0 15px 0; font-size: 20px; text-align: center;">
          📋 Plano ${planName}
        </h3>
        <p style="margin: 0 0 10px 0; font-size: 16px; text-align: center;">
          <strong>Petições por mês:</strong> 
          <span style="color: ${planColor}; font-weight: bold; font-size: 18px;">
            ${planDetails.petitionsLimit === -1 ? 'Ilimitadas' : planDetails.petitionsLimit}
          </span>
        </p>
        
        <div style="margin-top: 20px;">
          <strong style="color: ${planColor};">✨ Benefícios Inclusos:</strong>
          <ul style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
            ${planDetails.features.map(feature => `<li>${feature}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/new-petition" class="button" style="color: white;">
          ${isPaidPlan ? 'Criar Minha Primeira Petição' : 'Criar Minha Petição Grátis'}
        </a>
      </div>
      
      ${isPaidPlan ? `
        <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>💳 Informações de Pagamento:</strong>
          <p style="margin: 10px 0 0;">
            Seu plano será renovado automaticamente no final do período. 
            Você pode gerenciar ou cancelar sua assinatura a qualquer momento nas configurações.
          </p>
        </div>
      ` : ''}
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          Aproveite ao máximo seu plano! Mantenha suas notificações ativadas 
          e acompanhe o progresso das suas petições em tempo real.
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre seu plano ou faturamento, entre em contato:
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
 * Template de Renovação/Troca de Plano (Cliente)
 */
export function planRenewalOrChangeEmailTemplate(
  clientName: string,
  newPlanName: 'Free' | 'Start' | 'Pro' | 'Elite',
  planDetails: {
    petitionsLimit: number;
    features: string[];
  },
  oldPlanName?: 'Free' | 'Start' | 'Pro' | 'Elite',
  appUrl: string = 'http://localhost:5176'
): string {
  const planColors = {
    Free: '#6b7280',
    Start: '#3b82f6',
    Pro: '#8b5cf6',
    Elite: '#f59e0b'
  };

  const planColor = planColors[newPlanName];
  
  const isRenewal = oldPlanName === newPlanName;
  const isUpgrade = oldPlanName && !isRenewal && ['Free', 'Start', 'Pro'].indexOf(oldPlanName) < ['Free', 'Start', 'Pro', 'Elite'].indexOf(newPlanName);
  const isDowngrade = oldPlanName && !isRenewal && !isUpgrade;
  const isPaidPlan = newPlanName !== 'Free';

  const actionText = isRenewal 
    ? 'renovado automaticamente' 
    : isUpgrade 
      ? 'atualizado' 
      : isDowngrade 
        ? 'alterado' 
        : 'ativado';

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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">
        ${isRenewal ? '🔄 Plano Renovado' : isUpgrade ? '⬆️ Upgrade Realizado' : '🔄 Plano Alterado'}
      </h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        ${isRenewal 
          ? `Seu <strong>Plano ${newPlanName}</strong> foi renovado com sucesso na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.`
          : oldPlanName
            ? `Seu plano foi ${actionText} de <strong>${oldPlanName}</strong> para <strong>${newPlanName}</strong> na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.`
            : `Seu <strong>Plano ${newPlanName}</strong> foi ativado na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.`
        }
      </p>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✅ ${isRenewal ? 'Renovação Confirmada!' : isUpgrade ? 'Upgrade Confirmado!' : 'Alteração Confirmada!'}</strong>
        <p style="margin: 10px 0 0;">
          ${isRenewal 
            ? 'Seu plano continua ativo com todos os benefícios.' 
            : isUpgrade 
              ? 'Parabéns! Agora você tem acesso a mais recursos e benefícios.' 
              : 'Suas alterações foram aplicadas com sucesso.'
          }
        </p>
      </div>
      
      ${oldPlanName && !isRenewal ? `
        <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>📊 Mudanças no Seu Plano:</strong>
          <p style="margin: 10px 0 0;">
            De <strong>${oldPlanName}</strong> para <strong>${newPlanName}</strong>
          </p>
        </div>
      ` : ''}
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid ${planColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: ${planColor}; margin: 0 0 15px 0; font-size: 20px; text-align: center;">
          📋 ${isRenewal ? 'Seu' : 'Novo'} Plano ${newPlanName}
        </h3>
        <p style="margin: 0 0 10px 0; font-size: 16px; text-align: center;">
          <strong>Petições ${isRenewal ? 'renovadas' : 'incluídas'}:</strong> 
          <span style="color: ${planColor}; font-weight: bold; font-size: 18px;">
            ${planDetails.petitionsLimit === -1 ? 'Ilimitadas' : planDetails.petitionsLimit}
          </span>
        </p>
        
        <div style="margin-top: 20px;">
          <strong style="color: ${planColor};">✨ Benefícios ${isRenewal ? 'Mantidos' : 'Inclusos'}:</strong>
          <ul style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
            ${planDetails.features.map(feature => `<li>${feature}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/new-petition" class="button" style="color: white;">
          ${isRenewal ? 'Criar Nova Petição' : 'Aproveitar Novo Plano'}
        </a>
      </div>
      
      ${isPaidPlan ? `
        <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>💳 Informações de ${isRenewal ? 'Renovação' : 'Pagamento'}:</strong>
          <p style="margin: 10px 0 0;">
            ${isRenewal 
              ? 'Seu plano foi renovado automaticamente. O próximo ciclo de cobrança ocorrerá no mesmo dia do próximo mês.'
              : 'Seu novo plano será renovado automaticamente no final do período. Você pode gerenciar sua assinatura nas configurações.'
            }
          </p>
        </div>
      ` : ''}
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Dica:</strong>
        <p style="margin: 10px 0 0;">
          ${isUpgrade 
            ? 'Aproveite os novos recursos e limites maiores do seu plano atualizado!'
            : 'Aproveite ao máximo seu plano! Acompanhe suas petições em tempo real e mantenha contato com os redatores.'
          }
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre seu plano ou faturamento, entre em contato:
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
 * Template de Aviso de Limite de Petições (Cliente)
 */
export function planLimitWarningEmailTemplate(
  clientName: string,
  currentPlanName: 'Start' | 'Pro' | 'Elite',
  remainingPetitions: number,
  totalPetitions: number,
  appUrl: string = 'http://localhost:5176'
): string {
  const planColors = {
    Start: '#3b82f6',
    Pro: '#8b5cf6',
    Elite: '#f59e0b'
  };

  const planColor = planColors[currentPlanName];

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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">⚠️ Limite de Petições Próximo</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        Este é um aviso importante sobre o uso do seu <strong>Plano ${currentPlanName}</strong> na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <strong style="font-size: 18px;">⚠️ Atenção: Limite Próximo!</strong>
        <p style="margin: 15px 0 10px 0; font-size: 16px;">
          Você utilizou <strong>${totalPetitions - remainingPetitions} de ${totalPetitions} petições</strong> do seu plano atual.
        </p>
        <p style="margin: 10px 0 0; font-size: 18px; color: ${COLORS.secondary}; font-weight: bold;">
          ${remainingPetitions === 1 ? 'Resta apenas 1 petição!' : `Restam apenas ${remainingPetitions} petições!`}
        </p>
      </div>
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${planColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📊 Status do Seu Plano:</strong>
        <p style="margin: 10px 0 0; font-size: 16px;">
          <strong>Plano Atual:</strong> <span style="color: ${planColor}; font-weight: bold;">${currentPlanName}</span>
        </p>
        <p style="margin: 5px 0 0; font-size: 16px;">
          <strong>Petições Disponíveis:</strong> ${remainingPetitions} de ${totalPetitions}
        </p>
      </div>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 O que fazer agora?</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
          <li>Aguarde a renovação automática do seu plano</li>
          <li>Faça um upgrade para ter mais petições imediatamente</li>
          <li>Gerencie suas petições atuais com atenção</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/settings?tab=plan" class="button" style="color: white;">
          Ver Planos e Fazer Upgrade
        </a>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🚀 Considere um Upgrade:</strong>
        <p style="margin: 10px 0 0;">
          ${currentPlanName === 'Start' 
            ? 'O <strong>Plano Pro</strong> oferece 14 petições/mês com entregas em 2 dias úteis e economia de R$ 10 por petição!'
            : currentPlanName === 'Pro'
              ? 'O <strong>Plano Elite</strong> oferece 70 petições/mês com entregas em 1 dia útil e o melhor custo-benefício!'
              : 'Você já está no nosso melhor plano! Aproveite as 70 petições e entregas prioritárias.'
          }
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Se tiver dúvidas sobre planos ou necessitar de ajuda, entre em contato:
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
 * Template de Cancelamento de Plano (Cliente)
 */
export function planCancellationEmailTemplate(
  clientName: string,
  cancelledPlanName: 'Start' | 'Pro' | 'Elite',
  unusedPetitions: number,
  cancellationDate: string,
  appUrl: string = 'http://localhost:5176'
): string {
  const planColors = {
    Start: '#3b82f6',
    Pro: '#8b5cf6',
    Elite: '#f59e0b'
  };

  const planColor = planColors[cancelledPlanName];

  const planDetails = {
    Start: {
      petitions: 4,
      validity: '30 dias',
      delivery: '3 dias úteis'
    },
    Pro: {
      petitions: 14,
      validity: '30 dias',
      delivery: '2 dias úteis'
    },
    Elite: {
      petitions: 70,
      validity: '30 dias',
      delivery: '1 dia útil'
    }
  };

  const details = planDetails[cancelledPlanName];

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
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">❌ Cancelamento de Plano Confirmado</h1>
    </div>
    
    <!-- Content -->
    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
        Olá <strong style="color: ${COLORS.primary}">${clientName}</strong>,
      </p>
      
      <p>
        Confirmamos o cancelamento do seu <strong>Plano ${cancelledPlanName}</strong> na <strong>Veredicta - Plataforma de Petições Jurídicas</strong>.
      </p>
      
      <div class="info-box" style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <strong style="font-size: 18px; color: #991b1b;">📋 Detalhes do Cancelamento</strong>
        <p style="margin: 15px 0 10px 0; font-size: 16px;">
          <strong>Plano Cancelado:</strong> <span style="color: ${planColor}; font-weight: bold;">${cancelledPlanName}</span>
        </p>
        <p style="margin: 5px 0 0; font-size: 16px;">
          <strong>Data do Cancelamento:</strong> ${cancellationDate}
        </p>
        ${unusedPetitions > 0 ? `
        <p style="margin: 5px 0 0; font-size: 16px;">
          <strong style="color: #ef4444;">Petições Não Utilizadas:</strong> <span style="color: #ef4444; font-weight: bold;">${unusedPetitions}</span>
        </p>
        ` : ''}
      </div>
      
      ${unusedPetitions > 0 ? `
      <div class="alert-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>⚠️ Atenção: Petições Perdidas</strong>
        <p style="margin: 10px 0 0;">
          As <strong>${unusedPetitions} petições não utilizadas</strong> do seu plano foram perdidas com o cancelamento e não poderão ser recuperadas.
        </p>
      </div>
      ` : ''}
      
      <div class="info-box" style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🔄 O que acontece agora?</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
          <li>Sua conta permanece ativa na plataforma</li>
          <li>Você retornou ao <strong>Plano Free</strong></li>
          <li>Para criar novas petições, será necessário contratar um plano</li>
          <li>Seu histórico de petições está preservado</li>
        </ul>
      </div>
      
      <div class="info-box" style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📊 O que você tinha no Plano ${cancelledPlanName}:</strong>
        <ul style="margin: 10px 0 0; padding-left: 20px; line-height: 1.8;">
          <li><strong>${details.petitions} petições</strong> por mês</li>
          <li>Validade de <strong>${details.validity}</strong></li>
          <li>Entrega em <strong>${details.delivery}</strong></li>
          <li>Suporte prioritário via chat</li>
        </ul>
      </div>
      
      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>💡 Mudou de Ideia?</strong>
        <p style="margin: 10px 0 0;">
          Você pode reativar seu plano ou escolher outro a qualquer momento! Todos os nossos planos oferecem excelente custo-benefício e entregas rápidas.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/settings?tab=plan" class="button" style="color: white;">
          Ver Planos Disponíveis
        </a>
      </div>
      
      <p style="margin-top: 30px;">
        Sentiremos sua falta! Se precisar de ajuda ou tiver alguma dúvida, nossa equipe está à disposição:
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

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

/**
 * Template para notificação interna do formulário de contato
 */
export function contactFormNotificationTemplate(
  data: ContactFormData,
  receivedAt: string
): string {
  const content = `
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">📨 Novo contato recebido</h1>
    </div>

    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0;">
        Olá <strong style="color: ${COLORS.primary};">Equipe Veredicta</strong>,
      </p>

      <p>Um novo formulário de contato foi enviado pelo site.</p>

      <div class="info-box" style="background: #eff6ff; border-left: 4px solid ${COLORS.primary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>👤 Dados do remetente</strong>
        <p style="margin: 10px 0 0;"><strong>Nome:</strong> ${data.name}</p>
        <p style="margin: 5px 0 0;"><strong>E-mail:</strong> <a href="mailto:${data.email}" style="color: ${COLORS.primary};">${data.email}</a></p>
        ${data.phone ? `<p style="margin: 5px 0 0;"><strong>Telefone:</strong> ${data.phone}</p>` : ''}
        <p style="margin: 5px 0 0;"><strong>Assunto:</strong> ${data.subject || 'Sem assunto informado'}</p>
        <p style="margin: 5px 0 0; font-size: 13px; color: #6b7280;"><strong>Recebido em:</strong> ${receivedAt}</p>
      </div>

      <div class="alert-box" style="background: #f3f4f6; border-left: 4px solid ${COLORS.secondary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <strong>📝 Mensagem</strong>
        <p style="margin: 10px 0 0; white-space: pre-wrap; color: #111827;">${data.message}</p>
      </div>

      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🔁 Próximos passos</strong>
        <p style="margin: 10px 0 0;">Responda este contato em até 1 dia útil para maximizar a conversão.</p>
      </div>

      <p style="margin-top: 30px;">
        Atenciosamente,<br>
        <strong style="color: ${COLORS.primary};">Site Veredicta</strong>
      </p>
    </div>
  `;

  return getBaseTemplate(content);
}

/**
 * Template de confirmação automática para o usuário que enviou contato
 */
export function contactFormConfirmationTemplate(
  name: string,
  subject: string,
  appUrl: string = 'http://localhost:5176'
): string {
  const content = `
    <div class="header" style="background: #ffffff; padding-bottom: 15px;">
      <div style="text-align: center; margin-bottom: 0px;">
        <img src="${LOGO_URL}" alt="Veredicta Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <div style="text-align: center; margin-bottom: 20px; margin-top: -30px;">
        <img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />
      </div>
      <h1 class="header-title" style="color: #1f2937; font-size: 22px; margin-bottom: 0;">✅ Recebemos sua mensagem</h1>
    </div>

    <div class="content" style="padding-top: 20px;">
      <p style="font-size: 16px; margin-top: 0;">
        Olá <strong style="color: ${COLORS.primary};">${name}</strong>,
      </p>

      <p>
        Agradecemos por entrar em contato com a <strong>Veredicta</strong>. Recebemos sua mensagem sobre <strong>${subject || 'o seu assunto'}</strong> e nossa equipe retornará em até 1 dia útil.
      </p>

      <div class="success-box" style="background: #d1fae5; border-left: 4px solid ${COLORS.success}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>🧑‍⚖️ Como podemos ajudar?</strong>
        <p style="margin: 10px 0 0;">
          Enquanto isso, você pode explorar nossos recursos e materiais gratuitos para acelerar seu trabalho jurídico.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/central-ajuda" class="button" style="color: white;">
          Acessar Central de Ajuda
        </a>
      </div>

      <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>📧 Importante:</strong>
        <p style="margin: 10px 0 0;">
          Caso não receba nosso retorno em até 1 dia útil, verifique sua caixa de spam ou responda este e-mail diretamente.
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

