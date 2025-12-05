import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Supabase Edge Function: Generate Password Reset Link
// Usa Firebase Admin SDK via npm package para gerar link e enviar apenas email customizado

interface RequestBody {
  email: string;
  redirectTo?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
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

    // Obter variáveis de ambiente
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    const continueUrl = redirectTo || defaultRedirect;

    // Credenciais do Firebase Admin SDK
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID') || 'veredicta-85b8c';
    const firebaseClientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
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
          error: 'Firebase Admin SDK não configurado. Configure FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no Supabase Dashboard.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 1. Tentar importar e inicializar Firebase Admin SDK
    let resetLink: string;
    
    try {
      console.log('📦 [generate-password-reset-link] Importando Firebase Admin SDK...');
      
      // Importar Firebase Admin SDK via npm
      const admin = await import("npm:firebase-admin@11.11.0");
      
      console.log('✅ [generate-password-reset-link] Firebase Admin SDK importado com sucesso');
      console.log(`🔍 [generate-password-reset-link] admin.apps existe? ${admin.apps !== undefined}`);
      console.log(`🔍 [generate-password-reset-link] admin.apps.length: ${admin.apps?.length ?? 'undefined'}`);

      // Verificar se já está inicializado
      // admin.apps pode ser undefined em algumas versões, então verificamos de forma segura
      const appsLength = (admin.apps && admin.apps.length) ? admin.apps.length : 0;
      
      if (appsLength === 0) {
        console.log('🔧 [generate-password-reset-link] Inicializando Firebase Admin SDK...');
        
        // Normalizar a chave privada - garantir que as quebras de linha estejam corretas
        let normalizedKey = firebasePrivateKey;
        
        // Se a chave não começa com -----BEGIN, pode estar toda em uma linha
        if (!normalizedKey.includes('-----BEGIN PRIVATE KEY-----')) {
          console.warn('⚠️ [generate-password-reset-link] Chave privada pode estar mal formatada');
        }
        
        // Substituir \\n por quebras de linha reais
        normalizedKey = normalizedKey.replace(/\\n/g, '\n');
        
        // Garantir que não há espaços extras no início/fim
        normalizedKey = normalizedKey.trim();
        
        // Verificar se a chave tem o formato correto
        if (!normalizedKey.includes('BEGIN PRIVATE KEY') || !normalizedKey.includes('END PRIVATE KEY')) {
          console.error('❌ [generate-password-reset-link] Chave privada não contém marcadores BEGIN/END');
          return new Response(
            JSON.stringify({ 
              error: 'Chave privada do Firebase está mal formatada. Verifique FIREBASE_PRIVATE_KEY no Supabase Dashboard.',
            }),
            { status: 500, headers: corsHeaders }
          );
        }
        
        console.log(`📝 [generate-password-reset-link] Chave privada normalizada. Tamanho: ${normalizedKey.length} caracteres`);
        console.log(`📝 [generate-password-reset-link] Primeiros 50 chars: ${normalizedKey.substring(0, 50)}...`);
        console.log(`📝 [generate-password-reset-link] Últimos 50 chars: ...${normalizedKey.substring(normalizedKey.length - 50)}`);

        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: firebaseProjectId,
              clientEmail: firebaseClientEmail,
              privateKey: normalizedKey,
            }),
          });
          
          console.log('✅ [generate-password-reset-link] Firebase Admin inicializado com sucesso');
        } catch (initError: any) {
          console.error('❌ [generate-password-reset-link] Erro ao inicializar Firebase Admin:', initError);
          console.error('   Mensagem:', initError.message);
          console.error('   Stack:', initError.stack?.substring(0, 300));
          throw initError;
        }
      } else {
        console.log('ℹ️ [generate-password-reset-link] Firebase Admin já estava inicializado');
      }

      // 2. Gerar link de reset usando Firebase Admin SDK
      console.log(`📡 [generate-password-reset-link] Gerando link de reset via Firebase Admin SDK para: ${email}`);
      
      const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: true,
      };

      resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      console.log('✅ [generate-password-reset-link] Link gerado via Firebase Admin SDK:', resetLink.substring(0, 80) + '...');
      
    } catch (sdkError: any) {
      console.error('❌ [generate-password-reset-link] Erro ao usar Firebase Admin SDK:', sdkError);
      console.error('   Detalhes:', {
        message: sdkError.message,
        code: sdkError.code,
        stack: sdkError.stack?.substring(0, 200)
      });
      
      // Se o email não existe, retornar sucesso por segurança
      if (sdkError.code === 'auth/user-not-found') {
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
          error: 'Erro ao gerar link de reset. Tente novamente mais tarde.',
          details: sdkError.message || 'Erro desconhecido'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Enviar email personalizado via Resend
    try {
      console.log('📧 [generate-password-reset-link] Enviando email personalizado via Resend...');
      
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
              <a href="${resetLink}" style="display: inline-block; background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
            </div>
            <p style="font-size: 14px; color: #666;">Ou copie e cole este link no seu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${resetLink}</p>
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
        const emailResult = await emailResponse.json();
        console.log('✅ [generate-password-reset-link] Email personalizado enviado com sucesso:', emailResult);
        return new Response(
          JSON.stringify({ 
            success: true,
            resetLink: resetLink,
            message: 'Link de redefinição de senha enviado por email'
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        const emailError = await emailResponse.text();
        console.error('❌ [generate-password-reset-link] Erro ao enviar email:', emailError);
        // Mesmo se o email falhar, retornar o link (o usuário pode copiar)
        return new Response(
          JSON.stringify({ 
            success: true,
            resetLink: resetLink,
            message: 'Link de redefinição gerado. Verifique seu email.'
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    } catch (emailError) {
      console.error('❌ [generate-password-reset-link] Erro ao enviar email personalizado:', emailError);
      // Mesmo se o email falhar, retornar o link
      return new Response(
        JSON.stringify({ 
          success: true,
          resetLink: resetLink,
          message: 'Link de redefinição gerado. Verifique seu email.'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('❌ [generate-password-reset-link] Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar link de reset',
        details: error instanceof Error ? error.stack?.substring(0, 200) : 'N/A'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
