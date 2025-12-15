import { serve } from "https://deno.land/std@0.199.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  availablePetitionsEmailTemplate,
  invoiceReminderEmailTemplate,
  petitionAssignedEmailTemplate,
  newChatMessageEmailTemplate,
  petitionCompletedEmailTemplate,
} from "../_shared/emailTemplates.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

type SupportedNotificationType =
  | "invoice_reminder"
  | "petition"
  | "petition_available"
  | "message"
  | "petition_delivered";

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: SupportedNotificationType;
  related_entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

interface ProfileRow {
  firebase_uid: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
}

interface PetitionRow {
  id: string;
  display_id: string | null;
  title: string | null;
  deadline: string | null;
  assigned_writer_id: string | null;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function formatDeadline(deadline: string | null): string | undefined {
  if (!deadline) return undefined;
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
      JSON.stringify({
        error:
          "Missing environment variables. Check RESEND_API_KEY, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const now = new Date();
  const appUrl = Deno.env.get("APP_PUBLIC_URL") || "http://localhost:5176";

  // Garantir que notificações de nota fiscal do dia foram geradas
  await supabase.rpc("check_and_notify_invoice_upload");

  const { data: notifications, error: notificationsError } = await supabase
    .from<NotificationRow>("app_2d8133c678_notifications")
    .select(
      "id, user_id, title, message, type, related_entity_id, meta, created_at",
    )
    .in("type", ["invoice_reminder", "petition", "petition_available"])
    .is("email_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  if (notificationsError) {
    return new Response(
      JSON.stringify({
        error: "Failed to load notifications",
        details: notificationsError.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!notifications || notifications.length === 0) {
    return new Response(
      JSON.stringify({ success: true, processed: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const profileCache = new Map<string, ProfileRow | null>();
  const petitionCache = new Map<string, PetitionRow | null>();

  async function getProfile(userId: string): Promise<ProfileRow | null> {
    if (profileCache.has(userId)) {
      return profileCache.get(userId) ?? null;
    }

    const { data, error } = await supabase
      .from<ProfileRow>("profiles_v2")
      .select("firebase_uid, email, full_name, company_name")
      .eq("firebase_uid", userId)
      .maybeSingle();

    if (!error && data) {
      profileCache.set(userId, data);
      return data;
    }

    const { data: legacy, error: legacyError } = await supabase
      .from<ProfileRow>("user_profiles")
      .select("firebase_uid, email, full_name, company_name")
      .eq("firebase_uid", userId)
      .maybeSingle();

    if (legacyError) {
      console.warn("⚠️ Erro ao buscar perfil legado:", legacyError);
    }

    profileCache.set(userId, legacy ?? null);
    return legacy ?? null;
  }

  async function getPetition(petitionId: string): Promise<PetitionRow | null> {
    if (petitionCache.has(petitionId)) {
      return petitionCache.get(petitionId) ?? null;
    }

    const { data, error } = await supabase
      .from<PetitionRow>("petitions")
      .select("id, display_id, title, deadline, assigned_writer_id")
      .eq("id", petitionId)
      .maybeSingle();

    if (error) {
      console.warn("⚠️ Erro ao carregar petição:", error);
    }

    petitionCache.set(petitionId, data ?? null);
    return data ?? null;
  }

  async function sendEmail(to: string, subject: string, html: string) {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Veredicta - Plataforma <no-reply@veredictajus.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (response.status >= 400) {
      const text = await response.text();
      throw new Error(`Resend error: ${text}`);
    }
  }

  const results: Array<
    { notification_id: string; user_id: string; status: "sent" | "skipped" | "error"; reason?: string }
  > = [];

  for (const notification of notifications) {
    try {
      const profile = await getProfile(notification.user_id);

      if (!profile?.email) {
        results.push({
          notification_id: notification.id,
          user_id: notification.user_id,
          status: "skipped",
          reason: "missing_email",
        });
        continue;
      }

      const recipientName =
        profile.full_name ||
        profile.company_name ||
        profile.email.split("@")[0];

      if (notification.type === "invoice_reminder") {
        const monthLabel = formatMonth(
          notification.created_at ? new Date(notification.created_at) : now,
        );
        const html = invoiceReminderEmailTemplate(recipientName, monthLabel, appUrl);

        await sendEmail(
          profile.email,
          `🧾 Lembrete: Anexar Nota Fiscal - ${monthLabel}`,
          html,
        );
      } else if (notification.type === "petition") {
        if (!notification.related_entity_id) {
          results.push({
            notification_id: notification.id,
            user_id: notification.user_id,
            status: "skipped",
            reason: "missing_related_entity",
          });
          continue;
        }

        const petition = await getPetition(notification.related_entity_id);

        if (!petition) {
          results.push({
            notification_id: notification.id,
            user_id: notification.user_id,
            status: "skipped",
            reason: "petition_not_found",
          });
          continue;
        }

        if (
          petition.assigned_writer_id &&
          petition.assigned_writer_id !== notification.user_id
        ) {
          results.push({
            notification_id: notification.id,
            user_id: notification.user_id,
            status: "skipped",
            reason: "writer_mismatch",
          });
          continue;
        }

        const petitionId =
          petition.display_id?.trim() ||
          petition.id;
        const petitionTitle = petition.title || "Petição atribuída";
        const deadline = formatDeadline(petition.deadline);
        const html = petitionAssignedEmailTemplate(
          recipientName,
          petitionId,
          petitionTitle,
          deadline,
          appUrl,
        );

        await sendEmail(
          profile.email,
          `📋 Nova Petição Atribuída: ${petitionTitle}`,
          html,
        );
      } else if (notification.type === "petition_available") {
        const petitionsCount = 1;
        const html = availablePetitionsEmailTemplate(
          recipientName,
          petitionsCount,
          appUrl,
        );

        await sendEmail(
          profile.email,
          "📢 Nova Petição Disponível para Você",
          html,
        );
      } else if (notification.type === "message") {
        const senderName =
          (notification.meta && typeof notification.meta === "object"
            ? notification.meta["senderName"]
            : undefined) as string | undefined;

        const conversationTitle =
          (notification.meta && typeof notification.meta === "object"
            ? notification.meta["conversationTitle"]
            : undefined) as string | undefined;

        const chatContext =
          conversationTitle ||
          notification.message ||
          "Mensagem relacionada à sua petição";

        const html = newChatMessageEmailTemplate(
          recipientName,
          senderName || "Contato Veredicta",
          chatContext,
          appUrl,
        );

        await sendEmail(
          profile.email,
          `💬 Nova Mensagem de ${senderName || "um contato"}`,
          html,
        );
      } else if (notification.type === "petition_delivered") {
        if (!notification.related_entity_id) {
          results.push({
            notification_id: notification.id,
            user_id: notification.user_id,
            status: "skipped",
            reason: "missing_related_entity",
          });
          continue;
        }

        const petition = await getPetition(notification.related_entity_id);

        const petitionTitle = petition?.title || notification.title || "Sua petição";
        const html = petitionCompletedEmailTemplate(
          recipientName,
          petitionTitle,
          appUrl,
        );

        await sendEmail(
          profile.email,
          `✅ Petição Concluída: ${petitionTitle}`,
          html,
        );
      }

      const { error: updateError } = await supabase
        .from("app_2d8133c678_notifications")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", notification.id);

      if (updateError) {
        results.push({
          notification_id: notification.id,
          user_id: notification.user_id,
          status: "error",
          reason: `Failed to update notification: ${updateError.message}`,
        });
        continue;
      }

      results.push({
        notification_id: notification.id,
        user_id: notification.user_id,
        status: "sent",
      });
    } catch (error) {
      results.push({
        notification_id: notification.id,
        user_id: notification.user_id,
        status: "error",
        reason: (error as Error).message,
      });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed: notifications.length,
      results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

