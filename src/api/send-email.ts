import { Resend } from 'resend';

// Função para obter a API key do Resend
async function getResendApiKey(): Promise<string> {
  try {
    // Tentar importar do arquivo de configuração local
    const keys = await import('../config/keys.local');
    if (keys.LOCAL_KEYS?.RESEND_API_KEY) {
      return keys.LOCAL_KEYS.RESEND_API_KEY;
    }
  } catch (error) {
    // Arquivo não encontrado, usar variável de ambiente
    console.log('📝 Arquivo keys.local.ts não encontrado, usando env vars');
  }
  
  // Fallback: variáveis de ambiente
  return (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY || 
    import.meta.env?.VITE_RESEND_API_KEY || 
    ''
  );
}

export default async function handler(req: any, res: any) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // O vite-plugin-api-routes já faz o parsing do JSON automaticamente
    const { to, subject, html, from, replyTo } = req.body;

    console.log('📧 [API] Enviando email:', { to, subject, from, replyTo });

    // Validar dados
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      });
    }

    // Obter API key e inicializar Resend
    const apiKey = await getResendApiKey();
    
    if (!apiKey) {
      console.error('❌ [API] API key do Resend não encontrada.');
      return res.status(500).json({ 
        error: 'Email service not configured',
        message: 'API key not found. Please check keys.local.ts or environment variables.'
      });
    }

    const resend = new Resend(apiKey);

    // Enviar email via Resend
    // Domínio veredictajus.com verificado! ✅
    const resendPayload: any = {
      from: from || 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    };

    if (replyTo) {
      resendPayload.reply_to = replyTo;
    }

    const { data, error } = await resend.emails.send(resendPayload);

    if (error) {
      console.error('❌ [API] Erro ao enviar email:', error);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: error 
      });
    }

    console.log('✅ [API] Email enviado com sucesso:', data);

    // Retornar sucesso
    return res.json({ 
      success: true, 
      data 
    });

  } catch (error) {
    console.error('❌ [API] Erro geral:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

