"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Permission = NotificationPermission | "unsupported";
type AudioContextConstructor = new () => AudioContext;

export type NotificationCapabilities = {
  permission: Permission;
  soundSupported: boolean;
  vibrationSupported: boolean;
  voiceSupported: boolean;
  pushStatus: "unavailable" | "ready" | "error";
};

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
}

export async function requestNotificationPermission(): Promise<Permission> {
  if (typeof Notification === "undefined") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return "unsupported";
  }
}

function encodeVapidKey(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function useNotifications({
  notificationsEnabled,
  voiceEnabled,
  soundEnabled,
  soundVolume,
  vibrationEnabled,
}: {
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
}) {
  const [permission, setPermission] = useState<Permission>("default");
  const [audioSupported, setAudioSupported] = useState(false);
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationCapabilities["pushStatus"]>("unavailable");
  const audioContext = useRef<AudioContext | null>(null);
  const permissionRequestInFlight = useRef(false);

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    setAudioSupported(Boolean(getAudioContextConstructor()));
    setVibrationSupported(typeof navigator !== "undefined" && "vibrate" in navigator);
    setVoiceSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const ensureAudio = useCallback(async () => {
    const Constructor = getAudioContextConstructor();
    if (!Constructor) return null;
    try {
      const context = audioContext.current ?? new Constructor();
      if (context.state !== "running") await context.resume();
      audioContext.current = context;
      return context;
    } catch {
      return null;
    }
  }, []);

  const playSound = useCallback(async () => {
    const context = await ensureAudio();
    if (!context) return false;
    try {
      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, soundVolume), now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      gain.connect(context.destination);
      for (const [frequency, offset] of [[880, 0], [660, 0.18]] as const) {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + offset);
        oscillator.connect(gain);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + 0.2);
      }
      return true;
    } catch {
      return false;
    }
  }, [ensureAudio, soundVolume]);

  const vibrate = useCallback(() => {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return false;
    try {
      return navigator.vibrate([300, 150, 300]);
    } catch {
      return false;
    }
  }, []);

  const speak = useCallback((message: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }, [voiceEnabled]);

  const registerPush = useCallback(async () => {
    const env = typeof process !== "undefined" && process?.env ? process.env : (import.meta as any)?.env || {};
    const vapidKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || (import.meta as any)?.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("unavailable");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: encodeVapidKey(vapidKey),
      });
      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        ...(sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!response.ok) throw new Error("Push subscription could not be saved.");
      setPushStatus("ready");
    } catch {
      setPushStatus("error");
    }
  }, []);

  const request = useCallback(async () => {
    if (typeof window === "undefined" || permissionRequestInFlight.current) return;
    permissionRequestInFlight.current = true;
    try {
      const nextPermission = permission === "default"
        ? await requestNotificationPermission()
        : permission;
      setPermission(nextPermission);
      if (nextPermission === "granted") await registerPush();
      await ensureAudio();
    } finally {
      permissionRequestInFlight.current = false;
    }
  }, [ensureAudio, permission, registerPush]);

  const testNotification = useCallback(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
    try {
      new Notification("MediTrack test notification", {
        body: "Browser notifications are enabled.",
        icon: "/logo.svg",
        tag: "meditrack-test",
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === "undefined" || !notificationsEnabled) return;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/logo.svg", tag: `meditrack-${title}` });
      } catch {
        // The browser can revoke notification capability while the app is open.
      }
    }
    if (soundEnabled) void playSound();
    if (vibrationEnabled) vibrate();
    speak(`${title}. ${body}`);
  }, [notificationsEnabled, playSound, soundEnabled, vibrationEnabled, vibrate, speak]);

  return {
    permission,
    soundSupported: audioSupported,
    vibrationSupported,
    voiceSupported,
    speak,
    pushStatus,
    request,
    notify,
    testNotification,
    testSound: playSound,
    testVibration: vibrate,
  };
}
