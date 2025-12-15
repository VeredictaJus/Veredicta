// supabase/functions/notificar-admin/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { nome, email, arquivos } = await req.json();

  const links = arquivos.map((a: string, i: number) => `Petição ${i + 1}: ${a}`).join('\n');

  const message = {
    personalizations: [
      {
        to: [{ email: "contato@veredictajus.com" }],
        subject: `Novo redator aguardando aprovação: ${nome}`,
      },
    ],
    from: { email: "no-reply@veredictajus.com" },
    content: [
      {
        type: "text/plain",
        value: `
Novo redator aguardando aprovação:

Nome: ${nome}
Email: ${email}

Arquivos enviados:
${links}
        `,
      },
    ],
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (res.status >= 400) {
    return new Response("Erro ao enviar e-mail", { status: 500 });
  }

  return new Response("Email enviado com sucesso!", { status: 200 });
});
