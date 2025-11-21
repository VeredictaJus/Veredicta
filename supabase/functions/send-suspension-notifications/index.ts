import { serve } from "https://deno.land/std@0.199.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { writerSuspensionEmailTemplate } from "../../../src/services/emailTemplates.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

interface SuspensionProfile {
  firebase_uid: string;
  full_name: string | null;
  email: string | null;
  suspended_until: string | null;
  suspension_reason: string | null;
  total_late_deliveries: number | null;
  suspension_type: string | null;
  suspension_email_sent_at: string | null;
}

function determineSuspensionDays(profile: SuspensionProfile, now: Date): number {
  const totalLate = profile.total_late_deliveries ?? 0;

  if (profile.suspended_until) {
    const until = new Date(profile.suspended_until);
    if (!Number.isNaN(until.getTime()) && until > now) {
      const diffMs = until.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return diffDays;
      }
    }
  }

  if (totalLate >= 6) {
    return 60;
  }

  if (totalLate >= 3) {
    return 30;
  }

  return 30;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables. Check RESEND_API_KEY, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const now = new Date();
  const nowIso = now.toISOString();

  const { data, error } = await supabase
    .from<SuspensionProfile>("profiles_v2")
    .select(
      "firebase_uid, full_name, email, suspended_until, suspension_reason, total_late_deliveries, suspension_type, suspension_email_sent_at",
    )
    .eq("role", "writer")
    .is("suspension_email_sent_at", null)
    .gt("suspended_until", nowIso);

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load suspended writers", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const profiles = data ?? [];
  const results: Array<{ email?: string; status: "sent" | "skipped" | "error"; reason?: string }> = [];

  for (const profile of profiles) {
    if (!profile.email) {
      results.push({ status: "skipped", reason: "missing_email" });
      continue;
    }

    const suspensionDays = determineSuspensionDays(profile, now);
    if (suspensionDays <= 0) {
      results.push({ email: profile.email, status: "skipped", reason: "invalid_duration" });
      continue;
    }

    const lateCount = profile.total_late_deliveries ?? 0;
    const html = writerSuspensionEmailTemplate(
      profile.full_name || "Redator",
      lateCount,
      suspensionDays,
    );

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Veredicta - Plataforma <no-reply@veredictajus.com>",
        to: [profile.email],
        subject: "Sua conta foi suspensa temporariamente",
        html,
      }),
    });

    if (response.status >= 400) {
      const errorBody = await response.text();
      results.push({
        email: profile.email,
        status: "error",
        reason: `Resend error: ${errorBody}`,
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("profiles_v2")
      .update({
        suspension_email_sent_at: new Date().toISOString(),
        suspension_type: profile.suspension_type ?? "late_delivery",
      })
      .eq("firebase_uid", profile.firebase_uid);

    if (updateError) {
      results.push({
        email: profile.email,
        status: "error",
        reason: `Failed to update profile: ${updateError.message}`,
      });
      continue;
    }

    results.push({ email: profile.email, status: "sent" });
  }

  return new Response(
    JSON.stringify({
      processed: profiles.length,
      sent: results.filter((item) => item.status === "sent").length,
      details: results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

