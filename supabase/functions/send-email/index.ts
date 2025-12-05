import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string | string[];
}

serve(async (req) => {
  // CORS headers para permitir chamadas do frontend
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      },
    );
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured",
          message: "RESEND_API_KEY not found in environment variables"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        },
      );
    }

    // Parse request body
    const emailData: EmailRequest = await req.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: to, subject, html" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        },
      );
    }

    // Prepare Resend payload
    const resendPayload: any = {
      from: emailData.from || "Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>",
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
    };

    if (emailData.replyTo) {
      resendPayload.reply_to = Array.isArray(emailData.replyTo) 
        ? emailData.replyTo[0] 
        : emailData.replyTo;
    }

    // Send email via Resend
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Resend error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email",
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        },
      );
    }

    const result = await response.json();
    console.log("✅ Email sent successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      },
    );

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      },
    );
  }
});




