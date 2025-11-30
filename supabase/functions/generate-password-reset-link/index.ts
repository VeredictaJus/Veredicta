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

    // Obter credenciais do Firebase das variáveis de ambiente
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID');
    const firebasePrivateKey = Deno.env.get('FIREBASE_PRIVATE_KEY');
    const firebaseClientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') || 'https://www.veredictajus.com.br';

    if (!firebaseProjectId || !firebasePrivateKey || !firebaseClientEmail) {
      console.error('❌ Variáveis do Firebase não configuradas');
      return new Response(
        JSON.stringify({ error: 'Configuração do Firebase não encontrada' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Usar a API REST do Firebase Admin para gerar o link
    // Primeiro, precisamos obter um token de acesso usando as credenciais
    const defaultRedirect = `${appPublicUrl}/#/auth/reset-password`;
    const actionCodeSettings = {
      url: redirectTo || defaultRedirect,
      handleCodeInApp: true,
    };

    // Construir o payload para a API REST do Firebase Admin
    // Nota: Para gerar o link, precisamos usar o Firebase Admin SDK
    // Como estamos no Deno, vamos fazer uma chamada para um serviço backend que tem o Admin SDK
    // OU podemos usar o método OOB code generation do Firebase
    
    // Solução alternativa: usar o Firebase REST API diretamente para gerar o OOB code
    // Mas isso requer autenticação complexa. Vamos usar uma abordagem mais simples:
    // Chamar o próprio backend se disponível, ou retornar instruções para usar o método padrão
    
    // Chamar o backend que já existe (bridge/server.js)
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

