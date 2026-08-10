import { assertCapability, type TenantContext } from "@wyceno/database";

import { createClient } from "../supabase/server";

export type NotificationActivityItem = Readonly<{
  attemptCount: number;
  createdAt: string;
  errorCode: string | null;
  id: string;
  kind: "lead_company_alert" | "lead_customer_confirmation";
  recipient: string;
  sentAt: string | null;
  status: "failed" | "pending" | "processing" | "retry" | "sent";
}>;

export type NotificationActivity = Readonly<{
  items: NotificationActivityItem[];
  organizationName: string;
  summary: Readonly<{
    failed: number;
    pending: number;
    sent: number;
  }>;
}>;

export async function getNotificationActivity(
  context: TenantContext,
): Promise<NotificationActivity> {
  assertCapability(context, "organization:read");
  const supabase = await createClient();
  const periodStart = new Date();
  periodStart.setUTCDate(periodStart.getUTCDate() - 30);

  const [organizationResult, notificationsResult] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", context.organizationId).maybeSingle(),
    supabase
      .from("notifications")
      .select(
        "id, kind, recipient_email, status, attempt_count, sent_at, last_error_code, created_at",
      )
      .eq("organization_id", context.organizationId)
      .gte("created_at", periodStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (organizationResult.error || !organizationResult.data || notificationsResult.error) {
    throw new Error("Nie udało się pobrać aktywności powiadomień.");
  }

  const items = notificationsResult.data.map((notification) => ({
    attemptCount: notification.attempt_count,
    createdAt: notification.created_at,
    errorCode: notification.last_error_code,
    id: notification.id,
    kind: notification.kind,
    recipient: maskEmail(notification.recipient_email),
    sentAt: notification.sent_at,
    status: notification.status,
  }));

  return {
    items: items.slice(0, 12),
    organizationName: organizationResult.data.name,
    summary: {
      failed: items.filter((item) => item.status === "failed").length,
      pending: items.filter(
        (item) =>
          item.status === "pending" || item.status === "processing" || item.status === "retry",
      ).length,
      sent: items.filter((item) => item.status === "sent").length,
    },
  };
}

export function maskEmail(value: string | null): string {
  if (!value) return "Brak odbiorcy";
  const [local = "", domain = ""] = value.split("@");
  if (!domain) return "Nieprawidłowy adres";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}
