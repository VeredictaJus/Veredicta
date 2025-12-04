import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Supabase Edge Function: Generate Password Reset Link
// Gera link de reset de senha usando Firebase REST API e envia email via Resend

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

    // 1. Gerar link de reset usando Firebase REST API
    console.log(`📡 Gerando link de reset para: ${email}`);
    
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
      
      // Se o email não existe, retornar erro genérico por segurança
      if (firebaseResponse.status === 400) {
        return new Response(
          JSON.stringify({ 
            error: 'Se este email estiver cadastrado, você receberá um link de redefinição de senha.',
          }),
          { status: 200, headers: corsHeaders } // Retornar 200 para não expor se o email existe
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
    const resetLink = firebaseData.oobLink || firebaseData.email;

    // 2. Se o Firebase retornou um link, enviar email personalizado via Resend
    if (resetLink && resendApiKey) {
      try {
        // Importar template de email (usar template inline para evitar dependências)
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
          console.log('✅ Email de reset enviado com sucesso');
          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Link de redefinição de senha enviado por email'
            }),
            { status: 200, headers: corsHeaders }
          );
        } else {
          const emailError = await emailResponse.text();
          console.error('❌ Erro ao enviar email:', emailError);
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
        console.error('❌ Erro ao enviar email personalizado:', emailError);
        // Mesmo se o email personalizado falhar, o Firebase já enviou o email padrão
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Link de redefinição gerado. Verifique seu email.'
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // Se chegou aqui, retornar sucesso (Firebase já enviou o email)
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Link de redefinição de senha enviado por email'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Erro ao gerar link de reset:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar link de reset' 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
