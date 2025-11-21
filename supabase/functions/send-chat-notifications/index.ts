import { serve } from "https://deno.land/std@0.199.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { newChatMessageEmailTemplate } from "../../../src/services/emailTemplates.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  related_entity_id: string | null;
  created_at: string;
}

interface ProfileRow {
  email: string | null;
  full_name: string | null;
  company_name?: string | null;
}

interface MessageInfo {
  conversation_id: string;
  content: string | null;
  created_at: string;
  sender_id: string;
  sender_name: string | null;
  conversation_title: string | null;
}

async function findMessageInfo(
  supabase: ReturnType<typeof createClient>,
  notification: NotificationRow,
): Promise<MessageInfo | null> {
  if (!notification.related_entity_id) return null;

  const { data, error } = await supabase
    .from("messages")
    .select(`
      conversation_id,
      content,
      created_at,
      sender_id,
      sender:profiles_v2(full_name),
      conversation:conversations(title)
    `)
    .eq("conversation_id", notification.related_entity_id)
    .lte("created_at", notification.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("⚠️ Erro buscando mensagem do chat:", error);
    return null;
  }

  if (!data) return null;

  return {
    conversation_id: data.conversation_id,
    content: data.content,
    created_at: data.created_at,
    sender_id: data.sender_id,
    sender_name: data.sender?.full_name || null,
    conversation_title: data.conversation?.title || null,
  };
}

async function findUserProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles_v2")
    .select("email, full_name, company_name")
    .eq("firebase_uid", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.warn("⚠️ Erro buscando profile em profiles_v2:", error);
  } else if (data) {
    return data;
  }

  const { data: userProfile, error: legacyError } = await supabase
    .from("user_profiles")
    .select("email, full_name, company_name")
    .eq("firebase_uid", userId)
    .maybeSingle();

  if (legacyError && legacyError.code !== "PGRST116") {
    console.warn("⚠️ Erro buscando profile em user_profiles:", legacyError);
  }

  return userProfile ?? null;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables for Supabase/Resend." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: notifications, error } = await supabase
    .from<NotificationRow>("app_2d8133c678_notifications")
    .select("id, user_id, title, body, related_entity_id, created_at")
    .eq("type", "chat")
    .is("email_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(25);

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load chat notifications", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const processed = notifications ?? [];
  const results: Array<{ notification_id: string; status: "sent" | "skipped" | "error"; reason?: string }> = [];

  for (const notification of processed) {
    try {
      const profile = await findUserProfile(supabase, notification.user_id);
      if (!profile?.email) {
        results.push({ notification_id: notification.id, status: "skipped", reason: "missing_email" });
        continue;
      }

      const messageInfo = await findMessageInfo(supabase, notification);

      const recipientName =
        profile.full_name ||
        profile.company_name ||
        profile.email.split("@")[0];
      const senderName = messageInfo?.sender_name || "Remetente";
      const chatContext = messageInfo?.conversation_title ||
        notification.body ||
        "Mensagem relacionada à sua petição";
      const appUrl = Deno.env.get("APP_PUBLIC_URL") || "http://localhost:5176";
      const html = newChatMessageEmailTemplate(recipientName, senderName, chatContext, appUrl);

      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Veredicta - Plataforma <no-reply@veredictajus.com>",
          to: [profile.email],
          subject: `💬 Nova Mensagem de ${senderName}`,
          html,
        }),
      });

      if (response.status >= 400) {
        const text = await response.text();
        results.push({
          notification_id: notification.id,
          status: "error",
          reason: `Resend error: ${text}`,
        });
        continue;
      }

      const { error: updateError } = await supabase
        .from("app_2d8133c678_notifications")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", notification.id);

      if (updateError) {
        results.push({
          notification_id: notification.id,
          status: "error",
          reason: `Failed to update notification: ${updateError.message}`,
        });
        continue;
      }

      results.push({ notification_id: notification.id, status: "sent" });
    } catch (err) {
      results.push({
        notification_id: notification.id,
        status: "error",
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return new Response(
    JSON.stringify({
      processed: processed.length,
      sent: results.filter((item) => item.status === "sent").length,
      results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

