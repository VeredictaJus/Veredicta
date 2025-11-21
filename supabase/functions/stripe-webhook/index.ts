// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Missing required environment variables. Please set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
    apiVersion: "2025-06-30.basel",
  })
  : null;

const supabase = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
  : null;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!stripe || !stripeWebhookSecret || !supabase) {
    return new Response(
      JSON.stringify({
        error:
          "Stripe or Supabase not configured. Check STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "Missing Stripe signature header" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let event: Stripe.Event;
  let bodyText: string;

  try {
    bodyText = await req.text();
    event = stripe.webhooks.constructEvent(
      bodyText,
      signature,
      stripeWebhookSecret,
    );
  } catch (err) {
    console.error("⚠️  Stripe webhook signature verification failed:", err);
    return new Response(
      JSON.stringify({ error: "Invalid Stripe signature" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { error } = await supabase.rpc("process_stripe_webhook", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_raw_data: event as Record<string, unknown>,
  });

  if (error) {
    console.error("❌ Error executing process_stripe_webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to persist webhook event",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
