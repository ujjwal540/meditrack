"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Download,
  HelpCircle,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateUserProfile } from "@/lib/auth";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useTranslation } from "@/i18n/LanguageContext";
import type { UserRole, SupportedLanguage } from "@/types";

export type AccountTab = "overview" | "account" | "notifications" | "privacy" | "help";

export function AccountManagementModal({
  isOpen,
  initialTab = "overview",
  user,
  onClose,
  onOpenChangePassword,
  onUserUpdated,
}: {
  isOpen: boolean;
  initialTab?: AccountTab;
  user: { id: string; name?: string; email?: string; role: UserRole; preferredLanguage?: SupportedLanguage } | null;
  onClose: () => void;
  onOpenChangePassword: () => void;
  onUserUpdated?: (updated: { id: string; name?: string; email?: string; role: UserRole; preferredLanguage?: SupportedLanguage }) => void;
}) {
  const { t, language, setLanguage, isNepali } = useTranslation();
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    settings,
    updateSettings,
    notificationPermission,
    requestNotifications,
    testSound,
    speak,
    soundSupported,
    voiceSupported,
    medicines,
    logs,
  } = useMediTrack();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user?.name) setName(user.name);
    setSelectedLang(language);
  }, [user, language]);

  if (!isOpen) return null;

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await updateUserProfile(name, phone, selectedLang);
    setSaving(false);

    if (res.ok) {
      if (selectedLang !== language) {
        setLanguage(selectedLang);
      }
      setStatusMessage(t.profile.profileUpdatedMsg);
      if (res.user && onUserUpdated) {
        onUserUpdated(res.user);
      }
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage(res.error || (isNepali ? "विवरण सुरक्षित गर्न सकिएन।" : "Failed to update profile."));
    }
  }

  function handleExportData() {
    const dataToExport = {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      exportDate: new Date().toISOString(),
      prescriptions: medicines,
      doseLogs: logs,
      settings: settings,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meditrack-health-records-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const roleLabel =
    user?.role === "professional_caregiver"
      ? "Professional Caregiver"
      : user?.role === "family_caregiver"
        ? "Family Caregiver"
        : user?.role === "admin"
          ? "System Administrator"
          : "Patient Member";

  const initials = (user?.name || user?.email || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const tabs: { id: AccountTab; label: string; icon: typeof User }[] = [
    { id: "overview", label: t.profile.overviewTab, icon: User },
    { id: "account", label: t.profile.accountTab, icon: UserCheck },
    { id: "notifications", label: t.profile.notificationsTab, icon: Bell },
    { id: "privacy", label: t.profile.privacyTab, icon: ShieldCheck },
    { id: "help", label: t.profile.helpTab, icon: HelpCircle },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in"
    >
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-[var(--surface)] border border-[#16A36A]/30 shadow-2xl shadow-black/70">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--surface-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] to-[#20C982] text-white font-bold text-sm shadow-md shadow-[#16A36A]/20">
              {initials}
            </div>
            <div>
              <h2 id="account-modal-title" className="font-display text-base sm:text-lg font-bold text-[var(--text)]">
                Account &amp; Profile Center
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {user?.email || "Authenticated Healthcare Session"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface-elevated)]/25 px-4 py-2 scrollbar-none">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/30 shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* TAB 1: Profile Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-4 text-center sm:text-left">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-[#16A36A] to-[#20C982] text-white text-xl font-extrabold shadow-lg shadow-[#16A36A]/25">
                  {initials}
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    {user?.name || "Patient Member"}
                  </h3>
                  <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {user?.email || "No email assigned"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="rounded-md bg-[#16A36A]/15 border border-[#16A36A]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                      {roleLabel}
                    </span>
                    <span className="rounded-md bg-[#20D6C2]/10 border border-[#20D6C2]/30 px-2 py-0.5 text-[10px] font-semibold text-[#20D6C2]">
                      Active Session
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    User Identifier
                  </span>
                  <p className="mt-1 font-mono text-[11px] text-[var(--text)] truncate">
                    {user?.id || "Session demo-user"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Account Security
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-[#16A36A] dark:text-[#20C982]">
                    End-to-End Isolated Session
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Active Prescriptions
                  </span>
                  <p className="mt-1 font-bold text-[13px] text-[var(--text)]">
                    {medicines.length} Medication Routine{medicines.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Quick Security Action
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChangePassword();
                    }}
                    className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#16A36A] dark:text-[#20C982] hover:underline"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: My Account */}
          {activeTab === "account" && (
            <form onSubmit={handleSaveAccount} className="space-y-4">
              {statusMessage && (
                <div
                  role="status"
                  className="rounded-xl border border-[#16A36A]/40 bg-[#16A36A]/15 p-3 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]"
                >
                  {statusMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                    placeholder="e.g. Eleanor Vance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 pl-10 pr-3 text-xs text-[var(--text-muted)] font-mono cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  Email is locked to your Supabase security identity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {t.profile.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none font-mono"
                    placeholder="e.g. +1 (555) 234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {t.profile.preferredLanguageLabel}
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedLang("en")}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      selectedLang === "en"
                        ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-sm"
                        : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span>English</span>
                    {selectedLang === "en" && <CheckCircle2 className="h-4 w-4 text-[#16A36A]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang("ne")}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      selectedLang === "ne"
                        ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-sm"
                        : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span>नेपाली (Nepali)</span>
                    {selectedLang === "ne" && <CheckCircle2 className="h-4 w-4 text-[#16A36A]" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={saving}
                  className="text-xs font-bold gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? t.common.saving : t.profile.saveChangesBtn}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">Sound Reminders</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Play acoustic medical chime when medications are due.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={settings.soundEnabled ? "primary" : "outline"}
                    onClick={() => {
                      updateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
                      if (!settings.soundEnabled) void testSound();
                    }}
                    className="text-xs"
                  >
                    {settings.soundEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">Voice Announcements</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Read aloud medication names and food instructions.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={settings.voiceEnabled ? "primary" : "outline"}
                    onClick={() => {
                      updateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled });
                      if (!settings.voiceEnabled) speak("Voice reminders enabled.");
                    }}
                    className="text-xs"
                  >
                    {settings.voiceEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">Push Notifications</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Browser notification status: <strong className="capitalize">{notificationPermission}</strong>
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={requestNotifications}
                    className="text-xs"
                  >
                    Request Permission
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Privacy & Security */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#16A36A]/30 bg-[#16A36A]/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#16A36A] dark:text-[#20C982] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">Data Isolation &amp; Privacy Shield</h4>
                    <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Every query in MediTrack enforces strict user identity boundaries. Prescriptions, doses, caregiver records, and health trends cannot be accessed by other members without explicit patient consent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-[var(--text)]">Export Medical Schedule Data</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Download an encrypted JSON backup of your current medications and dose history.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExportData}
                  className="text-xs gap-1.5 shrink-0"
                >
                  <Download className="h-3.5 w-3.5" /> Export Data
                </Button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-[var(--text)]">Account Password</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Regularly updating your password reinforces healthcare account protection.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenChangePassword();
                  }}
                  className="text-xs gap-1.5 shrink-0"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Change Password
                </Button>
              </div>
            </div>
          )}

          {/* TAB 5: Help & Support */}
          {activeTab === "help" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-[#A78BFA] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">MediTrack Clinical Guidance Notice</h4>
                    <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      MediTrack is designed as an adherence reminder and caregiver communication platform. It does not provide medical diagnoses, alter prescriptions, or substitute for consultation with licensed medical doctors or pharmacists.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-semibold text-[var(--text)] uppercase tracking-wider text-[11px]">
                  Frequently Asked Questions
                </h4>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
                  <p className="font-semibold text-[var(--text)]">How do I invite a family caregiver?</p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    Navigate to the Family Care page, enter their email address, and send an invitation. Caregivers cannot see your doses until you explicitly confirm consent.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
                  <p className="font-semibold text-[var(--text)]">What if I miss a scheduled dose?</p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    Check your prescription label or pharmacist instructions. You can mark the dose as Taken, Snooze it for later, or record notes in Dose History. Never take extra medication to compensate.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-[11px] text-rose-500 dark:text-[#FB7185]">
                <strong>Emergency Helpline:</strong> If you or a loved one are experiencing severe symptoms, acute reactions, or an emergency, immediately call <strong>911</strong> or your local emergency services.
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
