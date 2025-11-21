import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, role, profileData } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ Usa a PUBLIC ANON KEY (não a service role)
    const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("ANON_KEY")!
);

    console.log("📨 Criando usuário público via signUp:", email);

    // Cria o usuário normalmente via API pública
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });

    if (error) {
      console.error("❌ Erro ao criar usuário:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = data.user;
    console.log("✅ Usuário criado:", user?.id);

    // ✅ Cria o perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ user_id: user?.id, email, role, status: "active" }]);

    if (profileError) {
      console.error("❌ Erro ao criar perfil:", profileError.message);
    }

    // ✅ Cria cliente, se aplicável
    if (role === "client" && profileData) {
      const { companyName, cnpj, contactPerson, phone, address } = profileData;
      const { error: clientError } = await supabase.from("clients").insert([
        {
          user_id: user?.id,
          company_name: companyName,
          cnpj,
          contact_person: contactPerson,
          phone,
          address,
        },
      ]);

      if (clientError) {
        console.error("❌ Erro ao criar cliente:", clientError.message);
      }
    }

    return new Response(JSON.stringify({ success: true, user_id: user?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Erro inesperado:", err.message);
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
