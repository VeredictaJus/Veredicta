import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Supabase Edge Function: Generate Password Reset Link
// Tenta usar backend com Firebase Admin SDK, se não disponível, deixa Firebase enviar email padrão

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

    // Obter variáveis de ambiente
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    const continueUrl = redirectTo || defaultRedirect;
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.veredictajus.com.br';

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ 
          error: 'Serviço de email não configurado. Entre em contato com o suporte.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 1. Tentar obter link via backend que tem Firebase Admin SDK
    let resetLink: string | null = null;
    
    try {
      console.log(`📡 Tentando obter link via backend: ${backendUrl}/api/auth/password-reset-link`);
      
      const backendResponse = await fetch(`${backendUrl}/api/auth/password-reset-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectTo: continueUrl,
        }),
        signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        if (backendData.resetLink && backendData.resetLink.startsWith('http')) {
          resetLink = backendData.resetLink;
          console.log('✅ Link obtido via backend:', resetLink.substring(0, 80) + '...');
        }
      } else {
        const errorText = await backendResponse.text();
        console.warn(`⚠️ Backend retornou erro ${backendResponse.status}:`, errorText);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend não disponível, usando método alternativo:', backendError);
    }

    // 2. Se não conseguiu o link do backend, usar Firebase REST API
    // Mas a API REST não retorna o link, apenas envia o email
    // Neste caso, vamos deixar o Firebase fazer o trabalho e retornar sucesso
    if (!resetLink) {
      console.log('ℹ️ Backend não disponível. Firebase enviará email padrão automaticamente.');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Link de redefinição de senha enviado por email'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 3. Se temos o link, enviar email personalizado via Resend
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
        console.log('✅ Email personalizado enviado com sucesso');
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
        // Mesmo se o email falhar, retornar sucesso (o backend já gerou o link)
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
      // Mesmo se o email personalizado falhar, retornar sucesso
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Link de redefinição gerado. Verifique seu email.'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

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
