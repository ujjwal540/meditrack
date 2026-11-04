"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import {
  Accessibility,
  CheckCircle2,
  LogOut,
  Moon,
  Paintbrush,
  ShieldCheck,
  Sun,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser, signOut } from "@/lib/auth";
import { LogoutConfirmDialog } from "@/components/profile/LogoutConfirmDialog";
import type { UserRole } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; email?: string; role: UserRole } | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    void getActiveUser().then(setCurrentUser);
  }, []);
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

  const { theme, setTheme } = useAccessibility();

  const selectStyle =
    "mt-1.5 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none";

  return (
    <PageShell
      title="Application Preferences"
      subtitle="Configure notifications, audio guidance, appearance, and accessibility."
    >
      <div className="max-w-2xl space-y-6">
        {/* Appearance & Theme Preference */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="icon-badge">
              <Paintbrush className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                Theme &amp; Appearance
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Choose your preferred visual styling. Medical Emerald (Dark Forest) is the official default.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-xs font-bold transition-all ${
                theme === "dark"
                  ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_15px_rgba(22,163,106,0.25)]"
                  : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#16A36A]/30"
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Medical Emerald (Dark)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-xs font-bold transition-all ${
                theme === "light"
                  ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#16A36A]/30"
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Clinical Light (Emerald)</span>
            </button>
          </div>
        </Card>

        {/* Easy Mode Switch */}
        <Card className={`p-6 transition-all ${settings.easyMode ? "border-[#16A36A]/40 bg-[#16A36A]/10" : ""}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="icon-badge">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text)]">
                  Easy Mode
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">
                  Larger fonts, high-contrast buttons, simplified controls, and bold reminders designed for elderly adults.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.easyMode}
              aria-label="Turn Easy Mode on or off"
              onClick={() => updateSettings({ ...settings, easyMode: !settings.easyMode })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A36A] ${
                settings.easyMode ? "bg-[#16A36A]" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.easyMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {settings.easyMode && (
            <p
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#16A36A]/15 border border-[#16A36A]/30 p-3 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Easy Mode is active across all MediTrack views.</span>
            </p>
          )}
        </Card>

        {/* Snooze & Grace Period Intervals */}
        <Card className="space-y-4 p-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Snooze Reminder Interval
            <select
              className={selectStyle}
              value={settings.snoozeMinutes}
              onChange={(e) => updateSettings({ ...settings, snoozeMinutes: Number(e.target.value) })}
            >
              {[5, 10, 15, 30].map((m) => (
                <option key={m} value={m} className="bg-[var(--surface-elevated)] text-[var(--text)]">
                  {m} minutes
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Caregiver Notification Grace Period
            <select
              className={selectStyle}
              value={settings.graceMinutes}
              onChange={(e) => updateSettings({ ...settings, graceMinutes: Number(e.target.value) })}
            >
              {[15, 30, 45, 60].map((m) => (
                <option key={m} value={m} className="bg-[var(--surface-elevated)] text-[var(--text)]">
                  {m} minutes
                </option>
              ))}
            </select>
          </label>
        </Card>

        {/* Reminder Modalities & Hardware Tests */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Audio &amp; Notification Hardware
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Current Browser Permission: <strong className="capitalize text-[#16A36A] dark:text-[#20C982]">{notificationPermission}</strong>
          </p>

          {notificationPermission !== "unsupported" && notificationPermission !== "denied" && (
            <Button
              size="sm"
              variant="primary"
              className="mt-3 text-xs"
              onClick={requestNotifications}
              disabled={notificationPermission !== "granted"}
            >
              {notificationPermission === "granted" ? "Notifications Enabled" : "Request Notifications"}
            </Button>
          )}

          {notificationPermission === "denied" && (
            <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500 dark:text-amber-300">
              Browser alerts are blocked. Allow notifications for this origin in browser settings, then reload. Sound and vibration remain testable below.
            </p>
          )}

          {notificationPermission === "unsupported" && (
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-xs text-[var(--text-secondary)]">
              Browser notification popups are unavailable on this device or context.
            </p>
          )}

          {/* Toggle Switches Grid */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 text-xs">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3.5">
              <span>
                <strong className="block text-[var(--text)]">Browser Notifications</strong>
                <span className="text-[11px] text-[var(--text-muted)]">Popups at scheduled dose time</span>
              </span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSettings({ ...settings, notificationsEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-[#16A36A] focus:ring-[#16A36A]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3.5">
              <span>
                <strong className="block text-[var(--text)]">Voice Assistance</strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {voiceSupported ? "Spoken dose announcements" : "Not supported in browser"}
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) => updateSettings({ ...settings, voiceEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-[#16A36A] focus:ring-[#16A36A]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3.5">
              <span>
                <strong className="block text-[var(--text)]">Audio Chimes</strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {soundSupported ? "Gentle chime sound" : "Not supported"}
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ ...settings, soundEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-[#16A36A] focus:ring-[#16A36A]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3.5">
              <span>
                <strong className="block text-[var(--text)]">Haptic Vibration</strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {vibrationSupported ? "Mobile vibration pulse" : "Not supported on this device"}
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => updateSettings({ ...settings, vibrationEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-[#16A36A] focus:ring-[#16A36A]"
              />
            </label>

            <label className="sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3.5">
              <span className="font-semibold text-[var(--text)] block text-xs">
                Chime Volume: {Math.round(settings.soundVolume * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => updateSettings({ ...settings, soundVolume: Number(e.target.value) })}
                className="mt-2.5 w-full accent-[#16A36A]"
              />
            </label>
          </div>

          {/* Test Buttons */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => testNotification()}
              disabled={notificationPermission !== "granted"}
              className="text-xs"
            >
              Test Notification
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void testSound()}
              disabled={!soundSupported || !settings.soundEnabled}
              className="text-xs"
            >
              Test Sound
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => speak("This is a MediTrack voice assistance test.")}
              disabled={!voiceSupported || !settings.voiceEnabled}
              className="text-xs"
            >
              Test Voice
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => testVibration()}
              disabled={!vibrationSupported || !settings.vibrationEnabled}
              className="text-xs"
            >
              Test Vibration
            </Button>
          </div>

          <p className="mt-4 font-mono text-[11px] text-[var(--text-muted)]">
            Push Background Status: <strong className="capitalize text-[var(--text-secondary)]">{pushStatus}</strong>.
          </p>
        </Card>

        {/* Account Profile & Session Isolation Section */}
        <Card className="p-5 sm:p-6 border-[#20D6C2]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="icon-badge">
                <ShieldCheck className="h-5 w-5 text-[#20D6C2]" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text)]">
                  Account &amp; Security Session
                </h2>
                <div className="mt-1 space-y-0.5 text-xs text-[var(--text-secondary)]">
                  <p>Signed in as: <strong className="text-[var(--text)]">{currentUser?.name || "Patient Member"}</strong></p>
                  {currentUser?.email && <p className="font-mono text-[11px] text-[var(--text-muted)]">{currentUser.email}</p>}
                  <p className="inline-block mt-1 rounded-md bg-[#16A36A]/10 border border-[#20D6C2]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#20D6C2]">
                    Role: {currentUser?.role?.replace("_", " ") || "Patient"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowLogoutDialog(true)}
              className="text-xs font-bold gap-2 self-start sm:self-auto"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
          <p className="mt-4 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
            Signing out clears your private session and cached medical timetable from this browser to prevent cross-account data leakage.
          </p>
        </Card>
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </PageShell>
  );
}
