import { computeEvents } from "@/utils/eventHelpers";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json(
      { error: "Missing VAPID env vars" },
      { status: 500 },
    );
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = createAdminClient();

  const { data: persons } = await supabase
    .from("persons")
    .select(
      "id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, is_deceased",
    );

  const todayEvents = computeEvents(persons ?? []).filter(
    (e) => e.daysUntil === 0,
  );

  if (todayEvents.length === 0) {
    return NextResponse.json({ sent: 0, events: 0 });
  }

  const title =
    todayEvents.length === 1
      ? "Nhắc nhở gia phả hôm nay"
      : `Nhắc nhở gia phả hôm nay (${todayEvents.length} sự kiện)`;
  const body = todayEvents
    .map(
      (e) =>
        `${e.type === "birthday" ? "🎂" : "🕯️"} ${e.personName} — ${
          e.type === "birthday" ? "sinh nhật" : "ngày giỗ"
        }`,
    )
    .join("\n");

  const payload = JSON.stringify({ title, body, url: "/dashboard/events" });

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key");

  let sent = 0;
  const staleIds: string[] = [];

  await Promise.all(
    (subscriptions ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          payload,
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(sub.id);
        }
      }
    }),
  );

  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return NextResponse.json({
    sent,
    events: todayEvents.length,
    staleRemoved: staleIds.length,
  });
}
