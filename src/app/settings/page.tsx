"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMediTrack } from "@/components/reminders/ReminderProvider";

export default function SettingsPage() {
  const { settings, updateSettings, notificationPermission, requestNotifications } = useMediTrack();
  const sel = "mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3";
  return (
    <PageShell title="Settings">
      <div className="max-w-xl space-y-6">
        <Card className="space-y-4">
          <label className="block font-medium">Snooze length
            <select className={sel} value={settings.snoozeMinutes} onChange={(e) => updateSettings({ ...settings, snoozeMinutes: Number(e.target.value) })}>
              {[5, 10, 15, 30].map((m) => <option key={m} value={m}>{m} minutes</option>)}
            </select>
          </label>
          <label className="block font-medium">Caregiver grace period
            <select className={sel} value={settings.graceMinutes} onChange={(e) => updateSettings({ ...settings, graceMinutes: Number(e.target.value) })}>
              {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
            </select>
          </label>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Browser notifications</h2>
          <p className="mt-1 text-slate-700">
            Status: <strong>{notificationPermission}</strong>. Alerts include a notification, sound, and vibration when supported by your browser and device. The app must remain open.
          </p>
          {notificationPermission === "default" && (
            <Button className="mt-3" onClick={requestNotifications}>Enable alerts</Button>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
