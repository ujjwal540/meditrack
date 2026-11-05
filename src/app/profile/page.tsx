"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Contrast,
  Download,
  Edit3,
  ExternalLink,
  HeartPulse,
  KeyRound,
  Languages,
  Lock,
  LogOut,
  Mail,
  Moon,
  Phone,
  Pill,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  UserCheck,
  UserRound,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { LogoutConfirmDialog } from "@/components/profile/LogoutConfirmDialog";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { useTranslation } from "@/i18n/LanguageContext";
import { getActiveUser, updateUserProfile, changeUserPassword, signOut } from "@/lib/auth";
import { getConnections } from "@/services/caregiver-service";
import type { SupportedLanguage, UserRole } from "@/types";

export type ProfileTab =
  | "overview"
  | "personal"
  | "security"
  | "preferences"
  | "family"
  | "privacy";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language, setLanguage, isNepali, formatNumber } = useTranslation();
  const { theme, setTheme, contrast, toggle: toggleContrast, easyMode, toggleEasyMode } =
    useAccessibility();

  const {
    settings,
    updateSettings,
    notificationPermission,
    requestNotifications,
    testSound,
    speak,
    medicines,
    logs,
  } = useMediTrack();

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name?: string;
    email?: string;
    role: UserRole;
    preferredLanguage?: SupportedLanguage;
  } | null>(null);

  // Form Fields for Personal Information
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("unspecified");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);

  // Status & Feedback States
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalSuccessMsg, setPersonalSuccessMsg] = useState<string | null>(null);
  const [personalErrorMsg, setPersonalErrorMsg] = useState<string | null>(null);

  // Security Form States (Embedded)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Caregivers State
  const [caregiverCount, setCaregiverCount] = useState<number>(0);

  // Dialog Controls
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Read URL query tab
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ProfileTab | null;
    if (
      tabParam &&
      ["overview", "personal", "security", "preferences", "family", "privacy"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load User Data & Local Stored Profile
  useEffect(() => {
    void getActiveUser().then((u) => {
      if (u) {
        setCurrentUser(u);
        setName(u.name || "");
        if (u.preferredLanguage) {
          setSelectedLang(u.preferredLanguage);
        }
      }
    });

    // Load any optional profile details from localStorage for patient health card
    try {
      const extra = localStorage.getItem("meditrack.patient_profile_extra");
      if (extra) {
        const parsed = JSON.parse(extra);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.dob) setDob(parsed.dob);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.emergencyContact) setEmergencyContact(parsed.emergencyContact);
      }
    } catch {}

    // Load caregiver count
    void getConnections()
      .then((conns) => {
        setCaregiverCount(conns.length);
      })
      .catch(() => {
        setCaregiverCount(0);
      });
  }, []);

  // Update tab in state and update URL without full reload
  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  // Save Personal Information
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPersonal(true);
    setPersonalSuccessMsg(null);
    setPersonalErrorMsg(null);

    const res = await updateUserProfile(name, phone, selectedLang);
    setSavingPersonal(false);

    if (res.ok) {
      if (selectedLang !== language) {
        setLanguage(selectedLang);
      }
      if (res.user) {
        setCurrentUser(res.user);
      }

      // Persist clinical metadata locally
      try {
        localStorage.setItem(
          "meditrack.patient_profile_extra",
          JSON.stringify({
            phone,
            dob,
            gender,
            bloodGroup,
            emergencyContact,
          }),
        );
      } catch {}

      setPersonalSuccessMsg(
        isNepali
          ? "तपाईंको प्रोफाइल विवरण सफलतापूर्वक अद्यावधिक गरियो!"
          : "Personal profile updated successfully!",
      );
      setTimeout(() => setPersonalSuccessMsg(null), 4000);
    } else {
      setPersonalErrorMsg(
        res.error || (isNepali ? "विवरण सुरक्षित गर्न सकिएन।" : "Failed to update profile."),
      );
    }
  };

  // Handle Embedded Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError(
        isNepali
          ? "नयाँ पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।"
          : "New password must be at least 8 characters long.",
      );
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError(
        isNepali
          ? "पासवर्डमा कम्तीमा एउटा अक्षर र एउटा अङ्क समावेश गर्नुहोस्।"
          : "Password must contain both letters and numbers.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(
        isNepali ? "नयाँ पासवर्डहरू मिलेनन्।" : "New passwords do not match.",
      );
      return;
    }

    setSavingPassword(true);
    const res = await changeUserPassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (res.ok) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } else {
      setPasswordError(
        res.error ||
          (isNepali
            ? "पासवर्ड परिवर्तन गर्न सकिएन। कृपया हालको पासवर्ड जाँच्नुहोस्।"
            : "Failed to update password. Please check your current password."),
      );
    }
  };

  // Export encrypted JSON data backup
  const handleExportData = () => {
    const dataToExport = {
      user: {
        id: currentUser?.id,
        name: currentUser?.name,
        email: currentUser?.email,
        role: currentUser?.role,
        dob,
        gender,
        bloodGroup,
      },
      exportDate: new Date().toISOString(),
      prescriptions: medicines,
      doseLogs: logs,
      settings: settings,
      caregiversConnected: caregiverCount,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meditrack-health-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Danger Zone: Account Deletion Simulation
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") return;
    setIsDeletingAccount(true);
    try {
      localStorage.clear();
      await signOut();
      router.push("/login");
    } catch {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

  // Initials and Role Badge calculation
  const initials = (currentUser?.name || currentUser?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const roleLabel =
    currentUser?.role === "professional_caregiver"
      ? isNepali ? "हेरचाह विज्ञ" : "Professional Caregiver"
      : currentUser?.role === "family_caregiver"
        ? isNepali ? "पारिवारिक संरक्षक" : "Family Caregiver"
        : currentUser?.role === "admin"
          ? "System Administrator"
          : isNepali ? "बिरामी सदस्य" : "Patient Member";

  const totalLogsCount = Object.keys(logs).length;
  const takenLogsCount = Object.values(logs).filter((l) => l.status === "taken").length;
  const adherenceRate =
    totalLogsCount > 0 ? Math.round((takenLogsCount / totalLogsCount) * 100) : 100;

  const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: "overview", label: isNepali ? "सामान्य विवरण" : "Overview", icon: User },
    { id: "personal", label: isNepali ? "व्यक्तिगत जानकारी" : "Personal Info", icon: UserCheck },
    { id: "security", label: isNepali ? "सुरक्षा तथा सत्र" : "Security & Sessions", icon: ShieldCheck },
    { id: "preferences", label: isNepali ? "प्राथमिकताहरू" : "Preferences", icon: Contrast },
    { id: "family", label: isNepali ? "परिवार तथा पहुँच" : "Family Circle", icon: Users },
    { id: "privacy", label: isNepali ? "गोपनीयता र डेटा" : "Privacy & Data", icon: Download },
  ];

  return (
    <PageShell
      title={isNepali ? "खाता तथा प्रोफाइल केन्द्र" : "Profile & Account Center"}
      subtitle={
        isNepali
          ? "तपाईंको स्वास्थ्य पहिचान, सुरक्षा, पारिवारिक पहुँच तथा प्राथमिकताहरू"
          : "Manage your personal healthcare identity, security, preferences, and data"
      }
      showBackButton={true}
      backFallbackUrl="/dashboard"
    >
      <div className="space-y-6">
        {/* =========================================================================
            1. HERO PROFILE CARD (Edge-to-edge on mobile, expansive on desktop)
            ========================================================================= */}
        <Card className="relative overflow-hidden p-4 xs:p-5 sm:p-6 md:p-8 border-[#16A36A]/30 bg-gradient-to-br from-[var(--surface)] via-[var(--surface-elevated)] to-[var(--surface)] shadow-lg shadow-black/10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            {/* User Avatar with status dot and quick edit trigger */}
            <div className="relative shrink-0">
              <div className="grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#16A36A] via-[#10B981] to-[#20D6C2] text-white text-2xl sm:text-3xl font-extrabold shadow-xl shadow-[#16A36A]/25 border-2 border-white/20">
                {initials}
              </div>
              <span
                className="absolute -bottom-1 -right-1 block h-5 w-5 rounded-full border-3 border-[var(--surface)] bg-[#20D6C2] shadow-[0_0_10px_#20D6C2]"
                title="Active Healthcare Session"
                aria-label="Active Healthcare Session"
              />
            </div>

            {/* Profile Info Details */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)]">
                  {currentUser?.name || (isNepali ? "बिरामी सदस्य" : "Patient Member")}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#16A36A]/15 border border-[#16A36A]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  <CheckCircle2 className="h-3 w-3" />
                  {roleLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[var(--text-secondary)] font-mono">
                <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                  <Mail className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982] shrink-0" />
                  {currentUser?.email || "Active User Session"}
                </span>
                {phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#20D6C2] shrink-0" />
                    {phone}
                  </span>
                )}
              </div>

              {/* Security & Healthcare Notice */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" />
                  <span>
                    {isNepali
                      ? "संरक्षित स्वास्थ्य सेसन (AES-256)"
                      : "Protected Healthcare Session (RLS Isolated)"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#20D6C2]/10 border border-[#20D6C2]/30 px-2.5 py-1 text-[11px] font-medium text-[#20D6C2]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isNepali ? "सक्रिय सदस्यता" : "Verified Account"}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions on Header */}
            <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleTabChange("personal")}
                className="w-full sm:w-auto text-xs font-bold gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isNepali ? "विवरण सम्पादन" : "Edit Profile"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowLogoutDialog(true)}
                className="w-full sm:w-auto text-xs text-rose-600 dark:text-[#FB7185] border-rose-500/30 hover:bg-rose-500/10 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t.nav.signOut}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* =========================================================================
            2. REAL-TIME ACCOUNT & CLINICAL STATISTICS STRIP
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Stat 1: Active Prescriptions */}
          <Card className="p-4 border-[var(--border)] bg-[var(--surface)] hover:border-[#16A36A]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
                {isNepali ? "सक्रिय औषधिहरू" : "Active Medications"}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20C982]">
                <Pill className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display text-2xl font-black tabular-nums text-[var(--text)]">
              {formatNumber(medicines.length)}
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)] truncate">
              {medicines.length === 1
                ? isNepali ? "१ औषधि तालिकामा छ" : "1 active routine"
                : isNepali
                  ? `${formatNumber(medicines.length)} औषधि तालिकाहरू`
                  : `${medicines.length} scheduled routines`}
            </p>
          </Card>

          {/* Stat 2: Adherence Rate */}
          <Card className="p-4 border-[var(--border)] bg-[var(--surface)] hover:border-[#16A36A]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
                {isNepali ? "औषधि नियमितता" : "Adherence Score"}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#20D6C2]/15 text-[#20D6C2]">
                <HeartPulse className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display text-2xl font-black tabular-nums text-[var(--text)]">
              {formatNumber(adherenceRate)}%
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)] truncate">
              {isNepali ? "समयमा लिइएको मात्रा" : "Confirmed on schedule"}
            </p>
          </Card>

          {/* Stat 3: Caregivers in Circle */}
          <Card className="p-4 border-[var(--border)] bg-[var(--surface)] hover:border-[#16A36A]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
                {isNepali ? "हेरचाह समूह" : "Care Circle"}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/15 text-indigo-500 dark:text-indigo-400">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display text-2xl font-black tabular-nums text-[var(--text)]">
              {formatNumber(caregiverCount)}
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)] truncate">
              {isNepali ? "जोडिएका संरक्षकहरू" : "Connected caregivers"}
            </p>
          </Card>

          {/* Stat 4: Tracked Doses */}
          <Card className="p-4 border-[var(--border)] bg-[var(--surface)] hover:border-[#16A36A]/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
                {isNepali ? "अभिलेख राखिएको" : "Tracked Doses"}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display text-2xl font-black tabular-nums text-[var(--text)]">
              {formatNumber(totalLogsCount)}
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)] truncate">
              {isNepali ? "कुल दर्ता भएको मात्रा" : "Total confirmations"}
            </p>
          </Card>
        </div>

        {/* =========================================================================
            3. TAB NAVIGATION STRIP (Responsive, single-line, zero wrap)
            ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border)]">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  active
                    ? "bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/40 shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            4. TAB CONTENT SECTIONS
            ========================================================================= */}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Account Information Card */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
                <UserCheck className="h-5 w-5 text-[#16A36A] dark:text-[#20C982]" />
                <h3 className="font-display text-base font-bold text-[var(--text)]">
                  {isNepali ? "खाता जानकारी सारांश" : "Account Identity Summary"}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">{t.profile.fullNameLabel}</span>
                  <span className="font-bold text-[var(--text)]">
                    {currentUser?.name || "Patient Member"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">{t.profile.emailLabel}</span>
                  <span className="font-mono text-[var(--text)]">{currentUser?.email || "—"}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">{t.profile.phoneLabel}</span>
                  <span className="font-mono text-[var(--text)]">{phone || (isNepali ? "राखिएको छैन" : "Not set")}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">{t.profile.preferredLanguageLabel}</span>
                  <span className="font-semibold text-[#16A36A] dark:text-[#20C982]">
                    {language === "ne" ? "नेपाली (Nepali)" : "English"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[var(--text-secondary)]">User Identifier (ID)</span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[150px]">
                    {currentUser?.id || "demo-session"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleTabChange("personal")}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  {isNepali ? "व्यक्तिगत जानकारी सम्पादन गर्नुहोस्" : "Edit Personal Details"}
                </Button>
              </div>
            </Card>

            {/* Quick Actions & Security Snapshot */}
            <div className="space-y-4">
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
                  <ShieldCheck className="h-5 w-5 text-[#20D6C2]" />
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    {isNepali ? "सुरक्षा तथा सत्र" : "Security & Authentication"}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">Password Status</span>
                    <span className="font-semibold text-[#16A36A] dark:text-[#20C982]">
                      Active &amp; Protected
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">Current Session</span>
                    <span className="font-semibold text-[var(--text)]">
                      Web Browser (Encrypted)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[var(--text-secondary)]">Data Isolation</span>
                    <span className="font-semibold text-[#16A36A] dark:text-[#20C982]">
                      Patient Consent Enforced
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleTabChange("security")}
                    className="flex-1 text-xs font-semibold gap-1.5"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    {isNepali ? "पासवर्ड परिवर्तन" : "Change Password"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleExportData}
                    className="flex-1 text-xs font-semibold gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isNepali ? "डेटा डाउनलोड" : "Export Backup"}
                  </Button>
                </div>
              </Card>

              {/* Family Caregiver Quick Link */}
              <Card className="p-4 sm:p-5 border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--text)]">
                      {isNepali ? "पारिवारिक हेरचाह वृत्त" : "Family Care Circle"}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {caregiverCount > 0
                        ? isNepali
                          ? `${formatNumber(caregiverCount)} जना संरक्षकहरू जोडिएका छन्`
                          : `${caregiverCount} caregivers connected`
                        : isNepali
                          ? "कुनै पनि संरक्षक जोडिएको छैन"
                          : "No caregivers connected yet"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/family"
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/25 transition-colors shrink-0"
                >
                  {isNepali ? "व्यवस्थापन" : "Manage"}
                </Link>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <Card className="p-5 sm:p-6 md:p-8 space-y-6">
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="font-display text-lg font-bold text-[var(--text)]">
                {t.profile.personalInfoTitle}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isNepali
                  ? "औषधि सम्झाउने र हेरचाहकर्तासँगको समन्वयका लागि तपाईंको सही जानकारी आवश्यक हुन्छ।"
                  : "Keep your healthcare contact details and demographic information accurate for optimal reminder coordination."}
              </p>
            </div>

            {/* Notification messages */}
            {personalSuccessMsg && (
              <div
                role="status"
                className="flex items-center gap-2.5 rounded-xl border border-[#16A36A]/40 bg-[#16A36A]/15 p-3.5 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{personalSuccessMsg}</span>
              </div>
            )}
            {personalErrorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-xs font-semibold text-rose-600 dark:text-[#FB7185]"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{personalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePersonal} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    {t.profile.fullNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email Address (Read-only for security) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    {t.profile.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || ""}
                      className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 pl-10 pr-3.5 text-xs text-[var(--text-muted)] font-mono cursor-not-allowed"
                    />
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--text-muted)]">
                    {isNepali
                      ? "इमेल सुरक्षित लगइन पहिचानसँग जोडिएको छ।"
                      : "Email is bound to your authenticated Supabase identity."}
                  </span>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    {t.profile.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 9800000000"
                      className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    {isNepali ? "जन्म मिति (Date of Birth)" : "Date of Birth"}
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Biological Sex / Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    {isNepali ? "लिङ्ग (Biological Sex)" : "Biological Sex / Gender"}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20 transition-all"
                  >
                    <option value="unspecified">{isNepali ? "उल्लेख नगर्ने" : "Prefer not to say"}</option>
                    <option value="female">{isNepali ? "महिला (Female)" : "Female"}</option>
                    <option value="male">{isNepali ? "पुरुष (Male)" : "Male"}</option>
                    <option value="other">{isNepali ? "अन्य (Other)" : "Other"}</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    {isNepali ? "रक्त समूह (Blood Group)" : "Blood Group"}
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20 transition-all font-mono"
                  >
                    <option value="">{isNepali ? "छनोट गर्नुहोस्" : "Select if known"}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Preferred Language Selection Cards */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  {t.profile.preferredLanguageLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLang("en")}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-bold transition-all ${
                      selectedLang === "en"
                        ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-sm ring-1 ring-[#16A36A]"
                        : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Languages className="h-4 w-4" />
                      <span>English (Default)</span>
                    </div>
                    {selectedLang === "en" && <CheckCircle2 className="h-4 w-4 text-[#16A36A]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLang("ne")}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-bold transition-all ${
                      selectedLang === "ne"
                        ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-sm ring-1 ring-[#16A36A]"
                        : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Languages className="h-4 w-4" />
                      <span>नेपाली (Nepali)</span>
                    </div>
                    {selectedLang === "ne" && <CheckCircle2 className="h-4 w-4 text-[#16A36A]" />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={savingPersonal}
                  className="min-h-11 px-6 font-bold text-xs gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingPersonal ? t.common.saving : t.profile.saveChangesBtn}</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* TAB 3: ACCOUNT SECURITY & SESSIONS */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change Password Card */}
            <Card className="p-5 sm:p-6 md:p-8 space-y-5">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text)]">
                  {isNepali ? "पासवर्ड परिवर्तन" : "Change Login Password"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {t.profile.changePasswordPrompt}
                </p>
              </div>

              {passwordSuccess && (
                <div
                  role="status"
                  className="flex items-center gap-2.5 rounded-xl border border-[#16A36A]/40 bg-[#16A36A]/15 p-3.5 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    {isNepali
                      ? "पासवर्ड सफलतापूर्वक परिवर्तन भयो!"
                      : "Password successfully updated!"}
                  </span>
                </div>
              )}

              {passwordError && (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-xs font-semibold text-rose-600 dark:text-[#FB7185]"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {isNepali ? "हालको पासवर्ड" : "Current Password"}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3.5 text-xs text-[var(--text)] font-mono focus:border-[#16A36A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {isNepali ? "नयाँ पासवर्ड" : "New Password (min 8 characters)"}
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3.5 text-xs text-[var(--text)] font-mono focus:border-[#16A36A] focus:outline-none"
                    />
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                      <span className={newPassword.length >= 8 ? "text-[#16A36A]" : "text-[var(--text-muted)]"}>
                        ✓ 8+ chars
                      </span>
                      <span className={/[a-zA-Z]/.test(newPassword) ? "text-[#16A36A]" : "text-[var(--text-muted)]"}>
                        ✓ Letters
                      </span>
                      <span className={/[0-9]/.test(newPassword) ? "text-[#16A36A]" : "text-[var(--text-muted)]"}>
                        ✓ Numbers
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {isNepali ? "नयाँ पासवर्ड पुनः हाल्नुहोस्" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-3.5 text-xs text-[var(--text)] font-mono focus:border-[#16A36A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={savingPassword}
                    className="font-bold text-xs gap-1.5"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>{savingPassword ? t.common.saving : isNepali ? "पासवर्ड अद्यावधिक गर्नुहोस्" : "Update Password"}</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Active Sessions Card */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <Activity className="h-5 w-5 text-[#20D6C2]" />
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--text)]">
                      {isNepali ? "सक्रिय लगइन उपकरणहरू" : "Active Healthcare Sessions"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isNepali ? "यो खाता हाल सक्रिय रहेका यन्त्रहरू" : "Devices currently authenticated with your profile"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-xs text-rose-500 hover:bg-rose-500/10"
                >
                  {isNepali ? "सबैबाट लगआउट" : "Sign Out All"}
                </Button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#20D6C2] shadow-[0_0_8px_#20D6C2]" />
                    <span className="font-bold text-xs text-[var(--text)]">
                      Current Web Browser (Active)
                    </span>
                    <span className="rounded bg-[#16A36A]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#16A36A] dark:text-[#A3EAC1]">
                      THIS DEVICE
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[var(--text-secondary)]">
                    Session ID: {currentUser?.id || "demo-session"}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Protected by Supabase Row-Level Security &amp; End-to-End Encryption.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-xs shrink-0"
                >
                  {t.nav.signOut}
                </Button>
              </div>
            </Card>

            {/* Danger Zone: Account Deletion */}
            <Card className="p-5 sm:p-6 border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/15 space-y-3">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-500 dark:text-[#FB7185] border border-rose-500/30">
                  <Trash2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-rose-600 dark:text-[#FB7185]">
                    {isNepali ? "जोखिम क्षेत्र: खाता मेटाउने" : "Danger Zone: Purge Account Data"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {isNepali
                      ? "खाता मेटाउँदा तपाईंको सबै औषधिका तालिकाहरू, खुराकका इतिहासहरू र पारिवारिक सम्पर्कहरू स्थायी रूपमा मेटिनेछन्।"
                      : "Permanently delete your user profile, medication schedules, dose histories, and disconnect all family circles from this device."}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-xs font-bold gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isNepali ? "खाता स्थायी रूपमा मेटाउनुहोस्" : "Delete Account"}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: PREFERENCES & ACCESSIBILITY */}
        {activeTab === "preferences" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Appearance: Light / Dark Mode */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
                <Sun className="h-5 w-5 text-[#16A36A] dark:text-[#20C982]" />
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    {t.settings.themeSectionTitle}
                  </h3>
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
                      ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-sm ring-1 ring-[#16A36A]"
                      : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]"
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
                      ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] shadow-sm ring-1 ring-[#16A36A]"
                      : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>{t.settings.themeLight}</span>
                </button>
              </div>
            </Card>

            {/* High Contrast Accessibility Toggle */}
            <Card className={`p-5 sm:p-6 transition-all ${contrast ? "border-[var(--primary)] bg-[var(--primary)]/10" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20C982]">
                    <Contrast className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--text)]">
                      {isNepali ? "गाढा रङ मोड (High Contrast)" : "High Contrast Mode"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed max-w-md">
                      {isNepali
                        ? "लाइट र डार्क दुवै थिममा अक्षर, बटन, कार्ड किनारा र इनपुटको स्पष्टता बढाउँछ। ज्येष्ठ नागरिक तथा आँखा कमजोर भएकाहरूका लागि विशेष उपयोगी।"
                        : "Enhances text legibility, card borders, and interactive button boundaries across both Light and Dark themes for maximum accessibility."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={contrast}
                  onClick={toggleContrast}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#16A36A] ${
                    contrast ? "bg-[#16A36A]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      contrast ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </Card>

            {/* Easy Mode (Senior-Friendly) */}
            <Card className={`p-5 sm:p-6 transition-all ${easyMode ? "border-[#20D6C2] bg-[#20D6C2]/10" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#20D6C2]/15 text-[#20D6C2]">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--text)]">
                      {isNepali ? "सजिलो मोड (Senior / Easy Mode)" : "Easy Mode (Senior-Friendly)"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed max-w-md">
                      {isNepali
                        ? "अक्षरको आकार ठूलो पार्छ, बटनहरू छुन सजिलो बनाउँछ र अनावश्यक प्राविधिक विकल्पहरू लुकाउँछ।"
                        : "Enlarges typography, magnifies button touch targets to 48px+, and streamlines navigation for elder accessibility."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={easyMode}
                  onClick={toggleEasyMode}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#20D6C2] ${
                    easyMode ? "bg-[#20D6C2]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      easyMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </Card>

            {/* Audio & Voice Reminders */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
                <Volume2 className="h-5 w-5 text-[#16A36A] dark:text-[#20C982]" />
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    {isNepali ? "ध्वनि तथा बोलेर सम्झाउने सूचना" : "Sound Chimes & Voice Alerts"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isNepali ? "औषधि खाने बेला सुनिने घण्टी र बोलेर दिइने निर्देशन" : "Audio chimes and spoken voice prompts during medication times"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">Sound Chimes</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Plays soothing medical chime when dose arrives
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void testSound()}
                      className="text-xs"
                    >
                      Test Chime
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={settings.soundEnabled ? "primary" : "outline"}
                      onClick={() => updateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                      className="text-xs font-bold"
                    >
                      {settings.soundEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">Voice Announcements</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Reads aloud medication names in Nepali or English
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => speak(isNepali ? "औषधि खाने समय भयो।" : "It is time to take your medicine.")}
                      className="text-xs"
                    >
                      Test Voice
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={settings.voiceEnabled ? "primary" : "outline"}
                      onClick={() => updateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                      className="text-xs font-bold"
                    >
                      {settings.voiceEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">Browser Push Alerts</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Status: <strong className="capitalize">{notificationPermission}</strong>
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
            </Card>
          </div>
        )}

        {/* TAB 5: FAMILY CIRCLE & ACCESS */}
        {activeTab === "family" && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <Users className="h-5 w-5 text-[#16A36A] dark:text-[#20C982]" />
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--text)]">
                      {isNepali ? "पारिवारिक हेरचाह वृत्त" : "Caregiver Access & Sharing"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isNepali ? "तपाईंको अनुमतिमा आधारित पारिवारिक पहुँच" : "Family circle members connected to your routine"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/family"
                  className="rounded-xl border border-[#16A36A]/40 bg-[#16A36A]/15 px-3 py-1.5 text-xs font-bold text-[#16A36A] dark:text-[#A3EAC1] hover:bg-[#16A36A]/25 transition-colors"
                >
                  {isNepali ? "नयाँ निम्तो पठाउनुहोस्" : "+ Invite Member"}
                </Link>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-xs space-y-2">
                <p className="font-bold text-[var(--text)]">
                  {caregiverCount > 0
                    ? isNepali
                      ? `${formatNumber(caregiverCount)} जना पारिवारिक सदस्यहरू जोडिएका छन्`
                      : `${caregiverCount} family members currently connected`
                    : isNepali
                      ? "हाल कुनै पनि संरक्षक जोडिनुभएको छैन।"
                      : "No family members or caregivers currently linked."}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isNepali
                    ? "परिवारका सदस्यहरूले तपाईंको औषधिको खुराक समयमै लिइयो वा छुट्यो भन्ने मात्र हेर्न सक्नेछन्। अन्य निजी विवरण सुरक्षित रहन्छ।"
                    : "Connected caregivers can only observe whether scheduled medication doses were confirmed or missed to ensure your well-being. All private notes remain strictly confidential."}
                </p>
              </div>

              <div className="pt-2 flex justify-start">
                <Link
                  href="/family"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A36A] dark:text-[#20C982] hover:underline"
                >
                  <span>{isNepali ? "पारिवारिक पृष्ठमा जानुहोस्" : "Open Family Care Hub"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 6: PRIVACY & DATA EXPORT */}
        {activeTab === "privacy" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Privacy Shield */}
            <Card className="p-5 sm:p-6 border-[#16A36A]/30 bg-[#16A36A]/10 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-[#16A36A] dark:text-[#20C982] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    {t.profile.privacyPolicyTitle}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {t.profile.privacyPolicyDesc}
                  </p>
                </div>
              </div>
            </Card>

            {/* Export Records */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--text)]">
                    {isNepali ? "स्वास्थ्य विवरण डाउनलोड (Export Data)" : "Export Medical Records"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isNepali
                      ? "आफ्ना सबै औषधि तालिका र खुराक इतिहासलाई JSON फाइलमा सुरक्षित गर्नुहोस्।"
                      : "Download an encrypted JSON backup of your current medication schedules, dose histories, and account preferences."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[var(--text)]">
                    Complete MediTrack Health Archive
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                    Includes {medicines.length} prescriptions · {totalLogsCount} dose records · Care circle links
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleExportData}
                  className="font-bold text-xs gap-1.5 shrink-0"
                >
                  <Download className="h-4 w-4" />
                  <span>{isNepali ? "डेटा डाउनलोड गर्नुहोस्" : "Download JSON"}</span>
                </Button>
              </div>
            </Card>

            {/* Clinical & Safety Disclaimer */}
            <Card className="p-5 sm:p-6 border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Clinical &amp; Medical Disclaimer</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isNepali
                  ? "मेडीट्रयाक केवल सम्झाउने र सूचना आदान-प्रदान गर्ने प्लेटफर्म हो। यसले चिकित्सकको सल्लाह, उपचार वा औषधि परिवर्तनको विकल्पको रूपमा काम गर्दैन। कुनै पनि स्वास्थ्य सम्बन्धी निर्णय लिनु अघि सधैं इजाजतपत्र प्राप्त डाक्टर वा फर्मासिस्टसँग परामर्श गर्नुहोस्।"
                  : "MediTrack is designed as a personal reminder and caregiver communication aid. It does not provide medical diagnoses, alter prescriptions, or substitute for professional medical judgment. Always consult a licensed healthcare professional regarding health concerns."}
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Change Password Dedicated Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />

      {/* Delete Account Double Confirmation Modal */}
      {showDeleteDialog && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
        >
          <Card className="relative w-full max-w-md p-6 bg-[var(--surface)] border border-rose-500/40 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-rose-600 dark:text-[#FB7185]">
                  {isNepali ? "खाता मेटाउने पुष्टि" : "Confirm Account Deletion"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">This action is permanent</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isNepali
                ? "यो कार्य फिर्ता गर्न सकिँदैन। पुष्टि गर्न तलको कोठामा DELETE टाइप गर्नुहोस्:"
                : "This will purge all your medication routines and dose history. Type DELETE to confirm:"}
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full min-h-11 rounded-xl border border-rose-500/40 bg-[var(--surface-elevated)] px-3 text-xs text-[var(--text)] font-mono"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={deleteConfirmationText !== "DELETE" || isDeletingAccount}
                onClick={handleDeleteAccount}
                className="font-bold text-xs"
              >
                {isDeletingAccount ? "Purging..." : "Confirm Deletion"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <PageShell title="Profile & Account Center" showBackButton={true} backFallbackUrl="/dashboard">
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 rounded-xl bg-[var(--surface-elevated)]" />
          <div className="h-24 rounded-xl bg-[var(--surface-elevated)]" />
          <div className="h-24 rounded-xl bg-[var(--surface-elevated)]" />
          <div className="h-24 rounded-xl bg-[var(--surface-elevated)]" />
        </div>
        <div className="h-64 rounded-2xl bg-[var(--surface-elevated)]" />
      </div>
    </PageShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
