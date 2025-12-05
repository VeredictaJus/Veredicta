import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Supabase Edge Function: Generate Password Reset Link
// Como o backend não está disponível, usa Firebase REST API e retorna um link placeholder
// O Firebase enviará o email padrão com o link funcional

interface RequestBody {
  email: string;
  redirectTo?: string;
}

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
    const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY') || 'AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM';
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    const continueUrl = redirectTo || defaultRedirect;

    // 1. Gerar código OOB via Firebase REST API
    // O Firebase enviará automaticamente um email com o link funcional
    console.log(`📡 Gerando código de reset para: ${email}`);
    
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
      
      // Se o email não existe, retornar sucesso por segurança (não expor se email existe)
      if (firebaseResponse.status === 400) {
        // Construir um link placeholder para o frontend não quebrar
        const placeholderLink = `${continueUrl}?mode=resetPassword&oobCode=placeholder`;
        return new Response(
          JSON.stringify({ 
            success: true,
            resetLink: placeholderLink,
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
    console.log('✅ Código OOB gerado pelo Firebase. Email enviado automaticamente.');

    // 2. Construir um link placeholder baseado no continueUrl
    // O Firebase já enviou o email com o link real, mas o frontend precisa de um resetLink
    // Vamos construir um link que redireciona para a página de reset
    // O usuário precisará usar o link que recebeu no email do Firebase
    const placeholderLink = `${continueUrl}?mode=resetPassword&oobCode=check-email`;
    
    // Retornar sucesso com link placeholder
    // O link real está no email que o Firebase enviou
    return new Response(
      JSON.stringify({ 
        success: true,
        resetLink: placeholderLink,
        message: 'Link de redefinição de senha enviado por email. Verifique sua caixa de entrada.'
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
