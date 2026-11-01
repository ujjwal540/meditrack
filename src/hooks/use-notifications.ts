"use client";

import { useCallback, useEffect, useState } from "react";

type Permission = NotificationPermission | "unsupported";

export function useNotifications() {
  const [permission, setPermission] = useState<Permission>("default");
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const request = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (typeof Notification !== "undefined") {
      setPermission(await Notification.requestPermission());
    } else {
      setPermission("unsupported");
    }

    const AudioContextConstructor = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextConstructor) {
      const context = audioContext ?? new AudioContextConstructor();
      await context.resume();
      setAudioContext(context);
    }
  }, [audioContext]);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/logo.svg", tag: "meditrack-reminder" });
    }

    if (audioContext?.state === "running") {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.18);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.38);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    }

    if ("vibrate" in navigator) {
      navigator.vibrate([300, 150, 300]);
    }
  }, [audioContext]);

  return { permission, request, notify };
}
