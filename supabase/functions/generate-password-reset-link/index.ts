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

    // 4. Enviar email personalizado via Resend (sem enviar email padrão do Firebase)
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Redefinição de Senha</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;">Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Veredicta</strong>.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${customResetLink}" style="display: inline-block; background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
            </div>
            <p style="font-size: 14px; color: #666;">Ou copie e cole este link no seu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${customResetLink}</p>
            <div style="background: #fef3c7; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0 0; padding-left: 20px;">
                <li>Este link expira em 1 hora</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Nunca compartilhe este link com outras pessoas</li>
              </ul>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Se você não solicitou esta redefinição, pode ignorar este email com segurança.
            </p>
            <p style="margin-top: 30px;">
              Atenciosamente,<br>
              <strong style="color: #ea580c;">Equipe Veredicta</strong>
            </p>
          </div>
        </body>
        </html>
      `;

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
