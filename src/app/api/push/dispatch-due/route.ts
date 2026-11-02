import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!cronSecret || !serviceRoleKey || !supabaseUrl || !privateKey || !publicKey || !subject) {
    return NextResponse.json({ error: "Push scheduler is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: due, error: dueError } = await admin.rpc("get_due_reminders");
  if (dueError) return NextResponse.json({ error: "Could not calculate due reminders." }, { status: 500 });

  let sent = 0;
  for (const reminder of due ?? []) {
    const { data: claimed, error: claimError } = await admin.from("push_deliveries").insert({
      user_id: reminder.user_id,
      schedule_id: reminder.schedule_id,
      scheduled_at: reminder.scheduled_at,
    }).select("id").maybeSingle();
    if (claimError || !claimed) continue;

    const { data: subscriptions } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", reminder.user_id);
    for (const subscription of subscriptions ?? []) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        }, JSON.stringify({
          title: reminder.title,
          body: reminder.body,
          tag: `meditrack-${reminder.schedule_id}`,
          url: "/dashboard",
        }));
        sent += 1;
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode === 404) {
          await admin.from("push_subscriptions").delete().eq("id", subscription.id);
        }
      }
    }
  }
  return NextResponse.json({ reminders: due?.length ?? 0, sent });
}
