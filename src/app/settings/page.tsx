"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  Accessibility,
  CheckCircle2,
  Contrast,
  Languages,
  LogOut,
  Moon,
  Paintbrush,
  ShieldCheck,
  Sun,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser } from "@/lib/auth";
import { LogoutConfirmDialog } from "@/components/profile/LogoutConfirmDialog";
import { NotificationModeSelector } from "@/components/dashboard/NotificationModeSelector";
import type { UserRole } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { t, isNepali, formatNumber } = useTranslation();
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

  const { theme, setTheme, contrast, toggle } = useAccessibility();

  const selectStyle =
    "mt-1.5 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none";

  return (
    <PageShell
      title={t.settings.pageTitle}
      subtitle={t.settings.pageSubtitle}
    >
      <div className="max-w-2xl space-y-6">
        {/* Prominent Bilingual Language Switcher Card */}
        <Card className="p-5 sm:p-6 border-[#16A36A]/40 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)]">
          <div className="flex items-center gap-3 mb-4">
            <span className="icon-badge bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20C982] border border-[#16A36A]/30">
              <Languages className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                {t.settings.languageSectionTitle}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {t.settings.languageSectionDesc}
              </p>
            </div>
          </div>

          <LanguageSwitcher variant="cards" />
        </Card>

        {/* Appearance & Theme Preference */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="icon-badge">
              <Paintbrush className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                {t.settings.themeSectionTitle}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {t.settings.themeSectionDesc}
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
              <span>{t.settings.themeDark}</span>
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
              <span>{t.settings.themeLight}</span>
            </button>
          </div>
        </Card>

        {/* High Contrast Accessibility Preference */}
        <Card className={`p-5 sm:p-6 transition-all ${contrast ? "border-[var(--primary)] bg-[var(--primary)]/10" : ""}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="icon-badge">
                <Contrast className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text)]">
                  {isNepali ? "गाढा रङ मोड (High Contrast)" : "High Contrast Mode"}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">
                  {isNepali
                    ? "लाइट र डार्क दुवै थिममा अक्षर, बटन, कार्ड किनारा र इनपुटको स्पष्टता बढाउँछ। ज्येष्ठ नागरिक तथा आँखा कमजोर भएकाहरूका लागि उपयोगी।"
                    : "Dramatically enhances readability, text contrast, card boundaries, and button visibility in both Light and Dark modes."}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={contrast}
              aria-label={contrast ? t.accessibility.highContrastOn : t.accessibility.highContrastOff}
              onClick={() => toggle("contrast")}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                contrast ? "bg-[var(--primary)]" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  contrast ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {contrast && (
            <p
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 p-3 text-xs font-semibold text-[var(--primary)] dark:text-[#A3EAC1]"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>
                {isNepali
                  ? "गाढा रङ (High Contrast) सक्रिय छ। सबै पृष्ठहरूमा स्पष्टता बढेको छ।"
                  : "High Contrast Mode is active across all MediTrack views."}
              </span>
            </p>
          )}
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
                  {t.settings.easyModeTitle}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">
                  {t.settings.easyModeDesc}
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
              <span>{t.settings.easyModeActiveMsg}</span>
            </p>
          )}
        </Card>

        {/* Snooze, Grace Period & Family Escalation Settings */}
        <Card className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
            <div>
              <strong className="block text-sm font-bold text-[var(--text)]">
                {isNepali ? "पारिवारिक हेरचाह सूचना (Family Care Alerts)" : "Family Care Escalation"}
              </strong>
              <span className="text-xs text-[var(--text-secondary)]">
                {isNepali
                  ? "औषधि तोकिएको समयभित्र नखाएमा अनुमतिप्राप्त पारिवारिक सदस्यलाई सतर्क गराउने"
                  : "Automatically alert connected caregivers if a scheduled dose remains unconfirmed"}
              </span>
            </div>
            <input
              type="checkbox"
              aria-label={isNepali ? "पारिवारिक हेरचाह सूचना" : "Family Care Escalation"}
              checked={settings.familyAlertsEnabled !== false}
              onChange={(e) => updateSettings({ ...settings, familyAlertsEnabled: e.target.checked })}
              className="h-5 w-5 rounded text-[#16A36A] focus:ring-[#16A36A] mt-1"
            />
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {t.settings.snoozeIntervalTitle}
            <select
              className={selectStyle}
              value={settings.snoozeMinutes}
              onChange={(e) => updateSettings({ ...settings, snoozeMinutes: Number(e.target.value) })}
            >
              {[5, 10, 15, 30].map((m) => (
                <option key={m} value={m} className="bg-[var(--surface-elevated)] text-[var(--text)]">
                  {formatNumber(m)} {t.common.minutes}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {t.settings.caregiverGraceTitle}
            <select
              className={selectStyle}
              value={settings.graceMinutes}
              onChange={(e) => updateSettings({ ...settings, graceMinutes: Number(e.target.value) })}
            >
              {[5, 10, 15, 30, 45, 60].map((m) => (
                <option key={m} value={m} className="bg-[var(--surface-elevated)] text-[var(--text)]">
                  {formatNumber(m)} {t.common.minutes}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {isNepali ? "घण्टी दोहोरिने अन्तराल (Alarm Repeat Interval)" : "Alarm Repeat Interval"}
            <select
              className={selectStyle}
              value={settings.repeatReminderInterval ?? 45}
              onChange={(e) => updateSettings({ ...settings, repeatReminderInterval: Number(e.target.value) })}
            >
              {[30, 45, 60].map((s) => (
                <option key={s} value={s} className="bg-[var(--surface-elevated)] text-[var(--text)]">
                  {formatNumber(s)} {isNepali ? "सेकेन्ड" : "Seconds"}
                </option>
              ))}
            </select>
          </label>
        </Card>

        {/* Global Medication Reminder Mode (Voice, Ringtone, Vibration) */}
        <NotificationModeSelector
          settings={settings}
          updateSettings={updateSettings}
          userName={currentUser?.name}
        />

        {/* Reminder Modalities & Hardware Tests */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            {t.settings.hardwareSectionTitle}
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {t.settings.currentPermission}: <strong className="capitalize text-[#16A36A] dark:text-[#20C982]">{notificationPermission}</strong>
          </p>

          {notificationPermission !== "unsupported" && notificationPermission !== "denied" && (
            <Button
              size="sm"
              variant="primary"
              className="mt-3 text-xs"
              onClick={requestNotifications}
              disabled={notificationPermission === "granted"}
            >
              {notificationPermission === "granted" ? t.settings.alertsEnabledBtn : t.settings.requestAlertsBtn}
            </Button>
          )}

          {notificationPermission === "denied" && (
            <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500 dark:text-amber-300">
              {isNepali
                ? "ब्राउजरमा सूचनाहरू बन्द छन्। ब्राउजर सेटिङबाट खोल्न सक्नुहुन्छ।"
                : "Browser alerts are blocked. Allow notifications for this origin in browser settings, then reload."}
            </p>
          )}

          {notificationPermission === "unsupported" && (
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-xs text-[var(--text-secondary)]">
              {isNepali
                ? "यस उपकरणमा ब्राउजर सूचना उपलब्ध छैन।"
                : "Browser notification popups are unavailable on this device or context."}
            </p>
          )}

          {/* Toggle Switches Grid */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 text-xs">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3.5">
              <span>
                <strong className="block text-[var(--text)]">{isNepali ? "ब्राउजर सूचना (Popups)" : "Browser Notifications"}</strong>
                <span className="text-[11px] text-[var(--text-muted)]">{isNepali ? "तोकिएको समयमा स्क्रीनमा सन्देश" : "Popups at scheduled dose time"}</span>
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
                <strong className="block text-[var(--text)]">{t.settings.voiceAnnounceTitle}</strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {voiceSupported ? t.settings.voiceAnnounceDesc : (isNepali ? "उपकरणमा आवाज उपलब्ध छैन" : "Not supported in browser")}
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
                <strong className="block text-[var(--text)]">{t.settings.soundChimeTitle}</strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {soundSupported ? t.settings.soundChimeDesc : (isNepali ? "उपलब्ध छैन" : "Not supported")}
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
                <strong className="block text-[var(--text)]">{isNepali ? "कम्पन (Vibration)" : "Haptic Vibration"}</strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {vibrationSupported ? (isNepali ? "मोबाइल कम्पन" : "Mobile vibration pulse") : (isNepali ? "उपलब्ध छैन" : "Not supported")}
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
                {t.settings.volumeSliderLabel}: {formatNumber(Math.round(settings.soundVolume * 100))}%
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
              {isNepali ? "सूचना परीक्षण" : "Test Notification"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void testSound()}
              disabled={!soundSupported || !settings.soundEnabled}
              className="text-xs"
            >
              {t.settings.testChimeBtn}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => speak(isNepali ? "यो मेडीट्रयाक आवाज परीक्षण हो। तपाईंको आवाज सहायता राम्ररी काम गर्दैछ।" : "This is a MediTrack voice assistance test.")}
              disabled={!voiceSupported || !settings.voiceEnabled}
              className="text-xs"
            >
              {t.settings.testVoiceBtn}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => testVibration()}
              disabled={!vibrationSupported || !settings.vibrationEnabled}
              className="text-xs"
            >
              {t.settings.testVibrationBtn}
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
                  {t.settings.accountSectionTitle}
                </h2>
                <div className="mt-1 space-y-0.5 text-xs text-[var(--text-secondary)]">
                  <p>{isNepali ? "लगइन गरिएको खाता:" : "Signed in as:"} <strong className="text-[var(--text)]">{currentUser?.name || (isNepali ? "बिरामी सदस्य" : "Patient Member")}</strong></p>
                  {currentUser?.email && <p className="font-mono text-[11px] text-[var(--text-muted)]">{currentUser.email}</p>}
                  <p className="inline-block mt-1 rounded-md bg-[#16A36A]/10 border border-[#20D6C2]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#20D6C2]">
                    {isNepali ? "भूमिका" : "Role"}: {currentUser?.role?.replace("_", " ") || "Patient"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
              <Button
                size="sm"
                variant="primary"
                onClick={() => router.push("/profile")}
                className="text-xs font-bold gap-1.5"
              >
                <UserCheck className="h-4 w-4" /> {isNepali ? "पूर्ण प्रोफाइल हेर्नुहोस्" : "Manage Profile"}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowLogoutDialog(true)}
                className="text-xs font-bold gap-2"
              >
                <LogOut className="h-4 w-4" /> {t.settings.signOutBtn}
              </Button>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
            {isNepali
              ? "लगआउट गर्दा तपाईंको सुरक्षित स्वास्थ्य सेसन र विवरण यस ब्राउजरबाट सुरक्षित रूपमा हटाइनेछ।"
              : "Signing out clears your private session and cached medical timetable from this browser to prevent cross-account data leakage."}
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
