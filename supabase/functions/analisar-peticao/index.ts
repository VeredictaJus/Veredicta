// Setup type definitions for Supabase Edge Functions
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Deno runtime
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  try {
    const { petitionText, petitionType } = await req.json();

    if (!petitionText || !petitionType) {
      return new Response(JSON.stringify({ error: "petitionText e petitionType são obrigatórios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `Você é um revisor jurídico especializado em Direito Brasileiro, com conhecimento em todas as áreas: civil, penal, trabalhista, tributário, constitucional, empresarial, previdenciário, administrativo, ambiental, entre outras.

Sua função é revisar petições jurídicas, avaliando:
- Coerência legal e argumentativa
- Citação correta de artigos
- Clareza, estrutura e gramática
- Ausência de falhas jurídicas ou lógicas

Considere que a petição abaixo se refere ao tipo: "${petitionType}". Analise o texto e responda no formato JSON com a seguinte estrutura:

{
  orthography: {
    score: número (0-100),
    corrections: número total,
    errors: [{ text, suggestion, position }]
  },
  legal: {
    score: número (0-100),
    adequacy: string,
    concerns: string[],
    articles: [{ article, valid, suggestion? }]
  },
  structure: {
    score: número (0-100),
    format_score: número (0-100),
    missing_elements: string[],
    suggestions: string[]
  },
  overall: {
    score: número (0-100),
    recommendation: "approve" | "review" | "reject",
    summary: string
  }
}

Texto da petição:
"""
${petitionText}
"""`;

    const chat = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Você é um assistente jurídico especialista." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const result = await chat.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) throw new Error("Resposta vazia da OpenAI");

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro ao processar petição:", err);
    return new Response(JSON.stringify({ error: "Erro ao processar petição." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
