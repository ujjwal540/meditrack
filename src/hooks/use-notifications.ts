"use client";

import { useCallback, useEffect, useState } from "react";

type Permission = NotificationPermission | "unsupported";

export function useNotifications() {
  const [permission, setPermission] = useState<Permission>("default");

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const request = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    setPermission(await Notification.requestPermission());
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "/logo.svg" });
  }, []);

  return { permission, request, notify };
}
