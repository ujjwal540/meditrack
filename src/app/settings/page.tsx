"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { Accessibility, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    notificationPermission,
    requestNotifications,
    testNotification,
    testSound,
    testVibration,
    soundSupported,
    vibrationSupported,
    voiceSupported,
    speak,
    pushStatus,
  } = useMediTrack();
  const sel = "mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3";
  return (
    <PageShell title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card className={`easy-focus ${settings.easyMode ? "border-[#355b48] bg-[#e7f1e7]" : ""}`}>
          <div className="flex items-start gap-4">
            <span className="icon-badge"><Accessibility className="h-7 w-7" aria-hidden="true" /></span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#355b48]">Easy Mode</h2>
              <p className="mt-1 text-[#707a73]">Larger text, bigger buttons, simpler navigation, and clearer medicine reminders.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.easyMode}
              aria-label="Turn Easy Mode on or off"
              onClick={() => updateSettings({ ...settings, easyMode: !settings.easyMode })}
              className="relative inline-flex min-h-12 min-w-24 cursor-pointer items-center justify-center rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#f4a261]"
            >
              <span className={`h-10 w-20 rounded-full transition-colors ${settings.easyMode ? "bg-[#355b48]" : "bg-slate-300"}`} />
              <span className={`pointer-events-none absolute left-2 h-7 w-7 rounded-full bg-white shadow transition-transform ${settings.easyMode ? "translate-x-10" : ""}`} />
            </button>
          </div>
          {settings.easyMode && <p role="status" className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-3 font-semibold text-[#355b48]"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Easy Mode is on. MediTrack is ready to be simpler.</p>}
        </Card>
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
          <h2 className="text-lg font-semibold">Reminder settings</h2>
          <p className="mt-1 text-slate-700">
            Notification permission: <strong className="capitalize">{notificationPermission}</strong>
          </p>
          {notificationPermission !== "unsupported" && notificationPermission !== "denied" && (
            <Button
              className="mt-3"
              onClick={requestNotifications}
              disabled={notificationPermission !== "default"}
            >
              {notificationPermission === "granted" ? "Notifications enabled" : "Enable notifications"}
            </Button>
          )}
          {notificationPermission === "denied" && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Notifications are blocked. Allow them for this site in your browser settings, then reload the page. Sound and vibration can still be tested separately.
            </p>
          )}
          {notificationPermission === "unsupported" && (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              This browser does not support notification popups. Use a current browser on HTTPS for the best support.
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <span><strong className="block">Browser notifications</strong><span className="text-sm text-slate-600">Popup at medicine time</span></span>
              <input type="checkbox" checked={settings.notificationsEnabled} onChange={(e) => updateSettings({ ...settings, notificationsEnabled: e.target.checked })} className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <span><strong className="block">Voice assistance</strong><span className="text-sm text-slate-600">{voiceSupported ? "Speak reminders and confirmations" : "Not supported in this browser"}</span></span>
              <input type="checkbox" checked={settings.voiceEnabled} onChange={(e) => updateSettings({ ...settings, voiceEnabled: e.target.checked })} className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <span><strong className="block">Sound / ringing</strong><span className="text-sm text-slate-600">{soundSupported ? "Supported after interaction" : "Not supported"}</span></span>
              <input type="checkbox" checked={settings.soundEnabled} onChange={(e) => updateSettings({ ...settings, soundEnabled: e.target.checked })} className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <span><strong className="block">Vibration</strong><span className="text-sm text-slate-600">{vibrationSupported ? "Supported on this device" : "Not supported"}</span></span>
              <input type="checkbox" checked={settings.vibrationEnabled} onChange={(e) => updateSettings({ ...settings, vibrationEnabled: e.target.checked })} className="h-5 w-5" />
            </label>
            <label className="rounded-xl border border-slate-200 p-4">
              <span className="font-semibold">Sound volume: {Math.round(settings.soundVolume * 100)}%</span>
              <input type="range" min="0.05" max="1" step="0.05" value={settings.soundVolume} onChange={(e) => updateSettings({ ...settings, soundVolume: Number(e.target.value) })} className="mt-3 w-full" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => testNotification()} disabled={notificationPermission !== "granted"}>Test notification</Button>
            <Button variant="outline" onClick={() => void testSound()} disabled={!soundSupported || !settings.soundEnabled}>Test sound</Button>
            <Button variant="outline" onClick={() => speak("This is a MediTrack voice assistance test.")} disabled={!voiceSupported || !settings.voiceEnabled}>Test voice</Button>
            <Button variant="outline" onClick={() => testVibration()} disabled={!vibrationSupported || !settings.vibrationEnabled}>Test vibration</Button>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Push status: <strong className="capitalize">{pushStatus}</strong>. Foreground reminders work while the app is open. Background push requires the secure server configuration described in the deployment notes.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
