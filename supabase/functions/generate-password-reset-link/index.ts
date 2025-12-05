// Supabase Edge Function - Deno runtime
// @ts-ignore - Deno imports não são reconhecidos pelo TypeScript
import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// @ts-ignore - Deno global não é reconhecido pelo TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface RequestBody {
  email: string;
  redirectTo?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

// @ts-ignore - Firebase Admin SDK via npm não tem tipos para Deno
import admin from "npm:firebase-admin@11.11.0";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { email, redirectTo } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'E-mail é obrigatório' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📧 [generate-password-reset-link] Processando reset para: ${email}`);

    // @ts-ignore - Deno.env não é reconhecido pelo TypeScript
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    // @ts-ignore
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    const continueUrl = redirectTo || defaultRedirect;

    // @ts-ignore
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID') || 'veredicta-85b8c';
    // @ts-ignore
    const firebaseClientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
    // @ts-ignore
    const firebasePrivateKey = Deno.env.get('FIREBASE_PRIVATE_KEY');

    console.log(`🔍 [generate-password-reset-link] Verificando variáveis de ambiente...`);
    console.log(`  - RESEND_API_KEY: ${resendApiKey ? '✅ configurada' : '❌ não configurada'}`);
    console.log(`  - FIREBASE_PROJECT_ID: ${firebaseProjectId}`);
    console.log(`  - FIREBASE_CLIENT_EMAIL: ${firebaseClientEmail ? '✅ configurada' : '❌ não configurada'}`);
    console.log(`  - FIREBASE_PRIVATE_KEY: ${firebasePrivateKey ? '✅ configurada' : '❌ não configurada'}`);

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ 
          error: 'Serviço de email não configurado. Entre em contato com o suporte.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!firebaseClientEmail || !firebasePrivateKey) {
      console.error('❌ Firebase Admin credentials não configuradas');
      return new Response(
        JSON.stringify({ 
          error: 'Firebase Admin SDK não configurado. Use o backend do Render para reset de senha.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 1. Tentar importar e inicializar Firebase Admin SDK
    let resetLink: string;
    
    try {
      console.log('📦 [generate-password-reset-link] Importando Firebase Admin SDK...');
      
      // Verificar se já está inicializado
      const appsLength = (admin.apps && admin.apps.length) ? admin.apps.length : 0;
      
      if (appsLength === 0) {
        console.log('🔧 [generate-password-reset-link] Inicializando Firebase Admin SDK...');
        
        let normalizedKey = firebasePrivateKey;
        normalizedKey = normalizedKey.replace(/\\n/g, '\n');
        normalizedKey = normalizedKey.trim();
        
        if (!normalizedKey.includes('BEGIN PRIVATE KEY') || !normalizedKey.includes('END PRIVATE KEY')) {
          console.error('❌ [generate-password-reset-link] Chave privada não contém marcadores BEGIN/END');
          return new Response(
            JSON.stringify({ 
              error: 'Chave privada do Firebase está mal formatada. Use o backend do Render.',
            }),
            { status: 500, headers: corsHeaders }
          );
        }
        
        console.log(`📝 [generate-password-reset-link] Chave privada normalizada. Tamanho: ${normalizedKey.length} caracteres`);

        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: firebaseProjectId,
              clientEmail: firebaseClientEmail,
              privateKey: normalizedKey,
            }),
          });
          console.log('✅ Firebase Admin inicializado com sucesso');
        } catch (initError) {
          console.error('❌ Erro ao inicializar Firebase Admin SDK com credenciais:', initError);
          return new Response(
            JSON.stringify({ 
              error: `Erro ao inicializar Firebase Admin SDK. Use o backend do Render: ${initError instanceof Error ? initError.message : 'Erro desconhecido'}`,
            }),
            { status: 500, headers: corsHeaders }
          );
        }
      } else {
        console.log('✅ Firebase Admin já inicializado');
      }

      // 2. Gerar link de reset usando Firebase Admin SDK
      console.log(`📡 Gerando link de reset via Firebase Admin SDK para: ${email}`);
      
      const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: true,
      };

      resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      console.log('✅ Link gerado via Firebase Admin SDK:', resetLink.substring(0, 80) + '...');
    } catch (linkError: any) {
      console.error('❌ Erro ao gerar link:', linkError);
      
      if (linkError.code === 'auth/user-not-found') {
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Se este email estiver cadastrado, você receberá um link de redefinição de senha.'
          }),
          { status: 200, headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Erro ao gerar link de reset. Use o backend do Render: ${linkError.message || 'Erro desconhecido'}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Extrair o oobCode do link do Firebase e construir link customizado
    let customResetLink = resetLink;
    try {
      const firebaseUrl = new URL(resetLink);
      const oobCode = firebaseUrl.searchParams.get('oobCode');
      const mode = firebaseUrl.searchParams.get('mode') || 'resetPassword';
      
      if (oobCode) {
        const customUrl = new URL(`${appPublicUrl}/#/auth/reset-password`);
        customUrl.searchParams.set('oobCode', oobCode);
        customUrl.searchParams.set('mode', mode);
        customResetLink = customUrl.toString();
        console.log(`✅ Link customizado criado: ${customResetLink.substring(0, 80)}...`);
      }
    } catch (urlError) {
      console.warn('⚠️ Erro ao construir link customizado, usando link do Firebase:', urlError);
    }

    // 4. Função helper para gerar template de email (mesmo template do frontend)
    const getPasswordResetEmailTemplate = (userName: string, resetLink: string): string => {
      const LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';
      const EMAIL_TEXT_LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Black%20Brown%20Modern%20Creative%20Portfolio%20Presentation%20(3).png';
      const COLORS = {
        primary: '#ea580c',
        primaryDark: '#c2410c',
        secondary: '#f97316',
        danger: '#ef4444',
        success: '#10b981',
      };

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
            <a href="${resetLink}" class="button" style="display: inline-block; background: ${COLORS.primary}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.3);">
              Redefinir Minha Senha
            </a>
          </div>
          
          <div class="alert-box" style="background: #fef2f2; border-left: 4px solid ${COLORS.danger}; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              <li>Este link expira em <strong>1 hora</strong></li>
              <li>Só funciona uma única vez</li>
              <li>Se você não solicitou esta redefinição, ignore este email</li>
            </ul>
          </div>
          
          <div class="info-box" style="background: #fef3c7; border-left: 4px solid ${COLORS.secondary}; padding: 15px; margin: 20px 0; border-radius: 4px;">
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
    };

    // 5. Enviar email personalizado via Resend (sem enviar email padrão do Firebase)
    try {
      const userName = email.split('@')[0]; // Extrair nome do email
      const emailHtml = getPasswordResetEmailTemplate(userName, customResetLink);

      const emailResponse = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
          to: [email],
          subject: '🔐 Redefinição de Senha - Veredicta',
          html: emailHtml,
        }),
      });

      if (emailResponse.ok) {
        console.log('✅ Email personalizado enviado com sucesso');
          return new Response(
          JSON.stringify({ 
            success: true,
            resetLink: customResetLink,
            message: 'Link de redefinição de senha enviado por email'
          }),
            { status: 200, headers: corsHeaders }
          );
      } else {
        const errorText = await emailResponse.text();
        console.error('❌ Erro ao enviar email:', errorText);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Falha ao enviar email personalizado: ${errorText}`,
          }),
          { status: emailResponse.status, headers: corsHeaders }
        );
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar email personalizado:', emailError);
    return new Response(
      JSON.stringify({ 
          success: false,
          error: `Erro ao enviar email personalizado: ${emailError instanceof Error ? emailError.message : 'Erro desconhecido'}`,
      }),
        { status: 500, headers: corsHeaders }
    );
    }

  } catch (error) {
    console.error('❌ Erro geral na Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
