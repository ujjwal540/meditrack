import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PushSubscriptionPayload = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authorization = request.headers.get("authorization");
  if (!serviceRoleKey || !supabaseUrl || !authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Push subscription is not configured." }, { status: 503 });
  }

  const requestBody = await request.json();
  const subscription = requestBody.subscription as PushSubscriptionPayload | undefined;
  const timezone = typeof requestBody.timezone === "string" ? requestBody.timezone : "UTC";
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys.auth) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const token = authorization.slice("Bearer ".length);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { error } = await admin.from("push_subscriptions").upsert({
    user_id: userData.user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  }, { onConflict: "user_id,endpoint" });
  if (error) return NextResponse.json({ error: "Could not save push subscription." }, { status: 500 });
  await admin.from("users").update({ timezone }).eq("id", userData.user.id);
  return NextResponse.json({ ok: true });
}
