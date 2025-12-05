import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Supabase Edge Function: Generate Password Reset Link
// SOLUÇÃO ALTERNATIVA: Usa Firebase REST API e envia email customizado
// Como o Firebase Admin SDK não funciona bem no Deno, vamos usar uma abordagem diferente

interface RequestBody {
  email: string;
  redirectTo?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const FIREBASE_IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1";

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
    const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY') || 'AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM';
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    const continueUrl = redirectTo || defaultRedirect;

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ 
          error: 'Serviço de email não configurado. Entre em contato com o suporte.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // SOLUÇÃO: Usar Firebase REST API para gerar código
    // O Firebase enviará o email padrão, mas vamos enviar um email complementar bonito
    // com instruções de onde encontrar o link no email do Firebase
    console.log('📡 [generate-password-reset-link] Gerando código via Firebase REST API...');
    
    const firebaseResponse = await fetch(
      `${FIREBASE_IDENTITY_TOOLKIT_URL}/accounts:sendOobCode?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: email,
          continueUrl: continueUrl,
        }),
      }
    );

    if (!firebaseResponse.ok) {
      const errorText = await firebaseResponse.text();
      console.error(`❌ Firebase retornou erro ${firebaseResponse.status}:`, errorText);
      
      // Se o email não existe, retornar sucesso por segurança
      if (firebaseResponse.status === 400) {
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
        }),
        { status: firebaseResponse.status, headers: corsHeaders }
      );
    }

    const firebaseData = await firebaseResponse.json();
    console.log('✅ [generate-password-reset-link] Firebase gerou código. Email padrão enviado.');

    // Enviar email complementar bonito com instruções
    // O usuário receberá o email do Firebase com o link funcional
    // E nosso email bonito explicando onde encontrar o link
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
            <p><strong>Você receberá um email do Firebase com o link para redefinir sua senha.</strong></p>
            <p>Por favor, verifique sua caixa de entrada e procure pelo email do Firebase. O link estará no email que você receberá em instantes.</p>
            <div style="background: #fef3c7; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0 0; padding-left: 20px;">
                <li>O link expira em 1 hora</li>
                <li>Se você não solicitou esta redefinição, ignore o email</li>
                <li>Nunca compartilhe o link com outras pessoas</li>
                <li>Verifique também a pasta de spam/lixo eletrônico</li>
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
        console.log('✅ [generate-password-reset-link] Email complementar enviado com sucesso');
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Link de redefinição de senha enviado por email. Verifique sua caixa de entrada.'
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        const emailError = await emailResponse.text();
        console.error('❌ [generate-password-reset-link] Erro ao enviar email:', emailError);
        // Mesmo se o email falhar, retornar sucesso (o Firebase já enviou)
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Link de redefinição gerado. Verifique seu email.'
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    } catch (emailError) {
      console.error('❌ [generate-password-reset-link] Erro ao enviar email complementar:', emailError);
      // Mesmo se o email falhar, retornar sucesso (Firebase já enviou)
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Link de redefinição gerado. Verifique seu email.'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('❌ [generate-password-reset-link] Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar link de reset' 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
