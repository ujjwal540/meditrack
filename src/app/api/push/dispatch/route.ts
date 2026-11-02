import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DispatchBody = {
  userId: string;
  title: string;
  body: string;
  tag?: string;
};

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!cronSecret || !serviceRoleKey || !supabaseUrl || !privateKey || !subject) {
    return NextResponse.json({ error: "Push dispatch is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<DispatchBody>;
  if (!payload.userId || !payload.title || !payload.body) {
    return NextResponse.json({ error: "userId, title and body are required." }, { status: 400 });
  }

  webpush.setVapidDetails(subject, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "", privateKey);
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", payload.userId);
  if (error) return NextResponse.json({ error: "Could not load subscriptions." }, { status: 500 });

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag ?? `meditrack-${payload.userId}`,
    url: "/dashboard",
  });
  const results = await Promise.allSettled((subscriptions ?? []).map((subscription) =>
    webpush.sendNotification({
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    }, message),
  ));
  const expiredIds = (subscriptions ?? [])
    .filter((_, index) => results[index].status === "rejected" && (results[index] as PromiseRejectedResult).reason?.statusCode === 404)
    .map((subscription) => subscription.id);
  if (expiredIds.length) await admin.from("push_subscriptions").delete().in("id", expiredIds);
  return NextResponse.json({ sent: results.filter((result) => result.status === "fulfilled").length });
}
