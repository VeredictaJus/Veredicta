import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Supabase Edge Function: Generate Password Reset Link
// Gera link de reset de senha usando Firebase Admin SDK via REST API

interface RequestBody {
  email: string;
  redirectTo?: string;
}

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

    // Obter URL do backend e da aplicação
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    
    // Chamar o backend que já existe (bridge/server.js) e tem Firebase Admin SDK configurado
    // Em produção, o backend deve estar em https://api.veredictajus.com.br
    // Em desenvolvimento, pode estar em http://localhost:3001
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.veredictajus.com.br';
    
    try {
      console.log(`📡 Tentando gerar link via backend em: ${backendUrl}/api/auth/password-reset-link`);
      
      const backendResponse = await fetch(`${backendUrl}/api/auth/password-reset-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectTo: redirectTo || defaultRedirect,
        }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        if (data.resetLink) {
          console.log('✅ Link gerado via backend com sucesso');
          return new Response(
            JSON.stringify({ resetLink: data.resetLink }),
            { status: 200, headers: corsHeaders }
          );
        }
      } else {
        const errorText = await backendResponse.text();
        console.error(`❌ Backend retornou erro ${backendResponse.status}:`, errorText);
      }
    } catch (backendError) {
      console.error('❌ Erro ao chamar backend:', backendError);
    }

    // Se o backend não estiver disponível, retornar erro informativo
    console.error('❌ Nenhum método disponível para gerar link de reset');
    return new Response(
      JSON.stringify({ 
        error: 'Serviço de geração de link não está disponível no momento. Por favor, tente novamente mais tarde ou entre em contato com o suporte.',
        details: 'O backend de autenticação não está respondendo. Verifique se o serviço está rodando em produção.'
      }),
      { status: 503, headers: corsHeaders }
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

