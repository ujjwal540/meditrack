"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  Mail,
  Phone,
  PhoneCall,
  Plus,
  Send,
  ShieldCheck,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import type { CaregiverConnection, CaregiverSchedule, CareReport, ConsentStatus, DoseLog } from "@/types";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CaregiverCard } from "@/components/family/CaregiverCard";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { supabase } from "@/lib/supabase";
import {
  acceptInvitation,
  addCaregiverSchedule,
  addCareReport,
  getCaregiverSchedules,
  getCareReports,
  getConnections,
  getCurrentUserId,
  inviteCaregiver,
  removeConnection,
  setConsent,
  updateCaregiverScheduleStatus,
} from "@/services/caregiver-service";
import Image from "next/image";
import { waitForSupabaseAuth } from "@/lib/supabase";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  acknowledgeFamilyAlert,
  getFamilyAlerts,
  type FamilyAlert,
} from "@/services/escalation-service";

type RemoteActivity = {
  medicineName: string;
  dosage: string;
  status: DoseLog["status"];
  time: string;
  date: string;
};

async function loadRemoteActivity(connections: CaregiverConnection[]): Promise<RemoteActivity[]> {
  if (!supabase) return [];
  const patientIds = connections
    .filter((connection) => connection.consentStatus === "granted" && connection.patientId)
    .map((connection) => connection.patientId!);
  if (patientIds.length === 0) return [];

  const { data: medicines, error: medicineError } = await supabase
    .from("medicines")
    .select("id, medicine_name, dosage, medicine_schedules(id, reminder_time), patient_id")
    .in("patient_id", patientIds);
  if (medicineError) throw new Error(`Could not load shared medicines: ${medicineError.message}`);

  const schedules = (medicines ?? []).flatMap((medicine) =>
    (medicine.medicine_schedules ?? []).map((schedule: { id: string; reminder_time: string }) => ({
      ...schedule,
      medicineName: medicine.medicine_name as string,
      dosage: medicine.dosage as string,
    })),
  );
  if (schedules.length === 0) return [];

  const { data: logs, error: logError } = await supabase
    .from("dose_logs")
    .select("schedule_id, scheduled_at, status")
    .in("schedule_id", schedules.map((schedule) => schedule.id))
    .order("scheduled_at", { ascending: false })
    .limit(20);
  if (logError) throw new Error(`Could not load shared dose updates: ${logError.message}`);

  return (logs ?? []).map((log) => {
    const schedule = schedules.find((item) => item.id === log.schedule_id);
    const scheduled = new Date(log.scheduled_at);
    return {
      medicineName: schedule?.medicineName ?? "Medicine",
      dosage: schedule?.dosage ?? "",
      status: log.status as DoseLog["status"],
      time: schedule?.reminder_time ?? scheduled.toISOString().slice(11, 16),
      date: scheduled.toLocaleDateString(),
    };
  });
}

export default function FamilyPage() {
  const { doses, user, userName } = useMediTrack();
  const { t, isNepali, formatNumber, formatTimeDisplay } = useTranslation();
  const [list, setList] = useState<CaregiverConnection[]>([]);
  const [remoteActivity, setRemoteActivity] = useState<RemoteActivity[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  // Family Care Escalation Alerts state
  const [familyAlerts, setFamilyAlerts] = useState<FamilyAlert[]>([]);

  // Caregiver features: Schedules & Reports state
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  const [reports, setReports] = useState<CareReport[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Schedule modal form state
  const [schedType, setSchedType] = useState<"call" | "visit">("call");
  const [schedPatient, setSchedPatient] = useState("Eleanor Vance (Mom)");
  const [schedDate, setSchedDate] = useState("2026-11-04");
  const [schedTime, setSchedTime] = useState("10:00");
  const [schedNotes, setSchedNotes] = useState("");

  // Report modal form state
  const [reportPatient, setReportPatient] = useState("Eleanor Vance (Mom)");
  const [reportType, setReportType] = useState<"call" | "visit" | "checkin">("call");
  const [reportAdherence, setReportAdherence] = useState("All scheduled morning doses confirmed");
  const [reportNotes, setReportNotes] = useState("");

  async function reload() {
    setError(null);
    setLoading(true);
    setFamilyAlerts(getFamilyAlerts());
    try {
      const session = await waitForSupabaseAuth();
      if (supabase && !session) {
        setAuthenticated(false);
        setList([]);
        setRemoteActivity([]);
        setCurrentUserId(null);
        return;
      }
      setAuthenticated(true);
      const [connections, currentId] = await Promise.all([
        getConnections(),
        getCurrentUserId(),
      ]);
      setList(connections);
      setCurrentUserId(currentId);
      const activity = await loadRemoteActivity(connections);
      setRemoteActivity(activity);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load Care Circle information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    setFamilyAlerts(getFamilyAlerts());
    setSchedules(getCaregiverSchedules());
    setReports(getCareReports());
  }, []);

  const activity = useMemo(() => {
    if (remoteActivity.length > 0) return remoteActivity;
    return doses.map((dose) => ({
      medicineName: dose.medicineName,
      dosage: dose.dosage,
      status: (dose.status === "pending" ? "not_confirmed" : dose.status) as DoseLog["status"],
      time: dose.time,
      date: isNepali ? "आज" : "Today",
    }));
  }, [remoteActivity, doses, isNepali]);

  const missed = activity.filter((item) => item.status === "not_confirmed");

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      await reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Family action could not be completed.");
    }
  }

  function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!schedPatient.trim() || !schedDate || !schedTime) return;
    addCaregiverSchedule({
      type: schedType,
      patientName: schedPatient,
      date: schedDate,
      time: schedTime,
      notes: schedNotes || undefined,
      status: "scheduled",
    });
    setSchedules(getCaregiverSchedules());
    setShowScheduleModal(false);
    setSchedNotes("");
  }

  function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportNotes.trim()) return;
    addCareReport({
      patientName: reportPatient,
      date: isNepali ? "आज" : "Today",
      visitType: reportType,
      adherenceObserved: reportAdherence,
      notes: reportNotes,
    });
    setReports(getCareReports());
    setShowReportModal(false);
    setReportNotes("");
  }

  const isCaregiver = user?.role === "family_caregiver" || user?.role === "professional_caregiver";

  return (
    <PageShell
      title={isCaregiver ? (isNepali ? "हेरचाहकर्ता कार्यस्थान" : "Caregiver Support Workspace") : t.family.pageTitle}
      subtitle={
        isCaregiver
          ? (userName
              ? (isNepali ? `${userName} को हेरचाह ड्यासबोर्ड। बिरामीको औषधि र तालिका समीक्षा गर्नुहोस्।` : `Care coordination dashboard for ${userName}. Review patient check-ins and schedules.`)
              : (isNepali ? "हेरचाह ड्यासबोर्ड। बिरामीको औषधि र तालिका समीक्षा गर्नुहोस्।" : "Care coordination dashboard. Review patient check-ins and schedules."))
          : t.family.pageSubtitle
      }
    >
      <div className="space-y-7">
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-500 dark:text-[#FB7185]"
          >
            {error}
          </p>
        )}

        {!loading && supabase && !authenticated && (
          <Card className="border border-amber-500/30 bg-amber-500/10 p-6">
            <h2 className="font-display text-lg font-bold text-amber-500 dark:text-amber-200">
              {isNepali ? "सक्रिय हेरचाह समूह हेर्न लग इन गर्नुहोस्" : "Sign in to view active Care Circle"}
            </h2>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-200/80">
              {isNepali ? "तपाईंको सत्र यो यन्त्रमा सक्रिय छैन।" : "Your remote session is not active on this device."}
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-4 text-xs font-bold text-white shadow-sm hover:brightness-105"
            >
              {t.nav.signIn}
            </Link>
          </Card>
        )}

        {/* Hero Care Circle Card */}
        <section className="relative overflow-hidden rounded-3xl border border-[#16A36A]/25 bg-gradient-to-br from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface-elevated)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#16A36A]/15 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#16A36A]/30 bg-[#16A36A]/10 px-3 py-1 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]">
                <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span>
                  {isCaregiver
                    ? (userName ? (isNepali ? `हेरचाहकर्ता: ${userName}` : `Caregiver: ${userName}`) : (isNepali ? "हेरचाह समन्वय पोर्टल" : "Caregiver Coordination Portal"))
                    : (isNepali ? "सहमतिमा आधारित हेरचाह समन्वय" : "Consent-Based Care Coordination")}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                {isCaregiver
                  ? (userName ? (isNepali ? `स्वागत छ, ${userName} ज्यू!` : `Welcome back, ${userName}!`) : (isNepali ? "हेरचाह समन्वय कार्यस्थान" : "Caregiver Coordination Workspace"))
                  : (userName ? (isNepali ? `तपाईंको हेरचाह समूहमा स्वागत छ, ${userName} ज्यू` : `Welcome to your Care Circle, ${userName}`) : (isNepali ? "हेरचाह तपाईंको नजिकै छ।" : "Care is closer than you think."))}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {isNepali
                  ? "पारिवारिक सदस्य र हेरचाहकर्तालाई जोड्नुहोस्। नियमित सम्पर्क तालिका बनाउनुहोस्, भेटघाट समन्वय गर्नुहोस् र पूर्ण सहमतिका साथ औषधिको ताजा अवस्था हेर्नुहोस्।"
                  : "Connect family members and caregivers for reassuring visibility. Schedule regular check-in calls, coordinate home visits, and log real-time care updates with complete consent control."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs font-bold"
                >
                  <CalendarDays className="h-4 w-4" /> {t.family.scheduleCallOrVisitBtn}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReportModal(true)}
                  className="text-xs font-semibold"
                >
                  <Send className="h-4 w-4" /> {t.family.addCareReportBtn}
                </Button>
              </div>
            </div>
            <div className="shrink-0 hidden md:block">
              <div className="relative h-32 w-32 rounded-3xl bg-[#16A36A]/10 border border-[#16A36A]/20 p-2 flex items-center justify-center shadow-inner">
                <Image
                  src="/images/illustrations/family-care.png"
                  alt="Family Care"
                  width={112}
                  height={112}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Family Care Escalation Alerts & Live Adherence Section */}
        <section aria-labelledby="escalations-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="icon-badge bg-rose-500/10 text-rose-500 dark:text-[#FB7185] border border-rose-500/25">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 id="escalations-heading" className="font-display text-lg font-bold text-[var(--text)]">
                  {isNepali ? "पारिवारिक हेरचाह सूचना तथा अलर्ट (Escalation Alerts)" : "Family Care Escalation Alerts"}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isNepali
                    ? "समयमा औषधि पुष्टि नभएमा परिवारका सदस्यलाई पठाइने स्वचालित सुरक्षा सूचनाहरू।"
                    : "Automatic safety notifications triggered when a dose is not confirmed within grace period."}
                </p>
              </div>
            </div>
            {familyAlerts.length > 0 && (
              <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-500 dark:text-[#FB7185]">
                {formatNumber(familyAlerts.filter((a) => a.status === "escalated").length)} {isNepali ? "सक्रिय" : "Active"}
              </span>
            )}
          </div>

          {familyAlerts.length === 0 ? (
            <Card className="p-4 sm:p-5 border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden="true" />
                <div className="text-xs">
                  <p className="font-bold text-[var(--text)]">
                    {isNepali ? "सबै पारिवारिक सदस्यहरूको औषधि समयमै व्यवस्थित छ" : "All Family Members on Track"}
                  </p>
                  <p className="text-[var(--text-secondary)] mt-0.5">
                    {isNepali
                      ? "हाल कुनै पनि छुटेको औषधि वा सक्रिय अलर्ट छैन। बिरामीले समयमै औषधि खाइरहेका छन्।"
                      : "No active missed dose escalations. Automatic notifications will appear here if a scheduled dose is missed."}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {familyAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`p-4 sm:p-5 border transition-all ${
                    alert.status === "escalated"
                      ? "border-rose-500/40 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                      : alert.status === "confirmed_late"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-[var(--border)] bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          alert.status === "escalated"
                            ? "bg-rose-500/15 text-rose-500 dark:text-[#FB7185] border border-rose-500/30"
                            : alert.status === "confirmed_late"
                              ? "bg-emerald-500/15 text-emerald-500 dark:text-[#36D399] border border-emerald-500/30"
                              : "bg-slate-500/15 text-[var(--text-muted)] border border-[var(--border)]"
                        }`}
                      >
                        {alert.status === "escalated" ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                            </span>
                            <span>{isNepali ? "तत्काल सम्पर्क आवश्यक" : "Missed Dose Escalation"}</span>
                          </>
                        ) : alert.status === "confirmed_late" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{isNepali ? "ढिलो पुष्टि भयो" : "Confirmed Late"}</span>
                          </>
                        ) : (
                          <span>{isNepali ? "हेरिएको" : "Acknowledged"}</span>
                        )}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                      {formatTimeDisplay(alert.scheduledTime)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-display text-sm sm:text-base font-bold text-[var(--text)]">
                      {alert.patientName}: {alert.medicineName} ({alert.dosage})
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                    <a
                      href="tel:"
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-105"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{isNepali ? "बिरामीलाई कल गर्नुहोस्" : "Call Patient"}</span>
                    </a>
                    {alert.status === "escalated" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          acknowledgeFamilyAlert(alert.id);
                          setFamilyAlerts(getFamilyAlerts());
                        }}
                        className="text-xs py-1 px-3"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isNepali ? "जानकारी टिपियो" : "Acknowledge"}</span>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Invite Form Card */}
        <Card className="p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-badge">
              <UsersRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                {t.family.inviteTitle}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {t.family.inviteSubtitle}
              </p>
            </div>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) return;
              void run(async () => {
                await inviteCaregiver(email, name);
                setEmail("");
                setName("");
              });
            }}
          >
            <input
              aria-label={t.family.inviteNameLabel}
              placeholder={isNepali ? "नाम (जस्तै: छोरा / छोरी)" : "Name (e.g. Sarah / Daughter)"}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#16A36A] focus:outline-none"
            />
            <input
              aria-label={t.family.inviteEmailLabel}
              type="email"
              required
              placeholder={isNepali ? "इमेल ठेगाना (जस्तै: family@example.com)" : "Email address (e.g. sarah@example.com)"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#16A36A] focus:outline-none"
            />
            <Button type="submit" size="sm" variant="primary" className="text-xs px-5">
              <Mail className="h-4 w-4" aria-hidden="true" /> {t.family.sendInviteBtn}
            </Button>
          </form>
          <p className="mt-3.5 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" aria-hidden="true" />
            <span>
              {isNepali
                ? "सुरक्षित पहुँच: बिरामीको अनुमति अनुसार मात्र औषधि विवरण देखाइन्छ। पहुँच जुनसुकै बेला रोक्न वा हटाउन सकिन्छ।"
                : "Encrypted access: Patient permissions govern who views dose logs. Access can be paused or revoked at any time."}
            </span>
          </p>
        </Card>

        {/* Scheduled Calls & Patient Visits Section */}
        <section aria-labelledby="schedules-heading">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 id="schedules-heading" className="font-display text-xl font-bold tracking-tight text-[var(--text)]">
                {t.family.careSchedulesHeading} ({formatNumber(schedules.length)})
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isNepali
                  ? "हेरचाहकर्ताहरूले नियमित फोन कल तथा प्रत्यक्ष भेटघाटको समय मिलाउन सक्नुहुन्छ।"
                  : "Caregivers can coordinate routine check-in calls and in-person patient visits."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isNepali ? "नयाँ तालिका" : "Schedule New"}</span>
            </Button>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {schedules.map((item) => (
              <Card
                key={item.id}
                className="p-5 flex flex-col justify-between hover:border-[#16A36A]/40 transition-all border border-[var(--border)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        item.type === "call"
                          ? "bg-blue-500/10 text-blue-500 dark:text-[#60A5FA] border-blue-500/25"
                          : "bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] border-[#16A36A]/25"
                      }`}
                    >
                      {item.type === "call" ? <Phone className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                      <span className="capitalize">
                        {item.type === "call" ? t.family.callType : t.family.visitType}
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.status === "completed" ? (isNepali ? "सम्पन्न" : "Completed") : (isNepali ? "निर्धारित" : "Scheduled")}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-[var(--text)]">
                    {item.patientName}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-secondary)] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[var(--text-muted)]" /> {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[var(--text-muted)]" /> {formatTimeDisplay(item.time)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  {item.status !== "completed" ? (
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        updateCaregiverScheduleStatus(item.id, "completed");
                        setSchedules(getCaregiverSchedules());
                      }}
                      className="text-xs py-1 px-3"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> {isNepali ? "सम्पन्न भयो भनी चिन्ह लगाउनुहोस्" : "Mark Completed"}
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {isNepali ? "सम्पन्न भयो" : "Completed"}
                    </span>
                  )}
                  {item.type === "call" && (
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <PhoneCall className="h-3.5 w-3.5 text-[#16A36A]" /> {isNepali ? "फोन कल" : "Voice Call"}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Active Care Connections */}
        <section aria-labelledby="connections-heading">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 id="connections-heading" className="font-display text-xl font-bold tracking-tight text-[var(--text)]">
              {t.family.connectedCaregiversHeading} ({formatNumber(list.length)})
            </h2>
          </div>
          {loading ? (
            <div className="skeleton h-28" />
          ) : list.length === 0 ? (
            <Card className="text-center p-8 border border-dashed border-[var(--border)]">
              <UsersRound className="mx-auto h-10 w-10 text-[var(--text-muted)] opacity-60" />
              <p className="mt-2 text-xs text-[var(--text-secondary)]">{t.family.noCaregiversYet}</p>
            </Card>
          ) : (
            <ul className="space-y-3">
              {list.map((connection) => (
                <li key={connection.id}>
                  <CaregiverCard
                    c={connection}
                    isIncoming={Boolean(currentUserId && connection.patientId !== currentUserId)}
                    onAccept={(id) => void run(() => acceptInvitation(id))}
                    onConsent={(id, status: ConsentStatus) => void run(() => setConsent(id, status))}
                    onRemove={(id) => void run(() => removeConnection(id))}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Live Shared Activity & Caregiver Reports Grid */}
        <section aria-labelledby="updates-heading" className="grid gap-6 lg:grid-cols-2">
          {/* Medicine Updates Feed */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="icon-badge">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="updates-heading" className="font-display text-base font-bold text-[var(--text)]">
                {t.family.remoteActivityHeading}
              </h2>
            </div>
            {activity.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">{t.family.noRemoteActivity}</p>
            ) : (
              <ul className="space-y-2.5">
                {activity.slice(0, 5).map((item, index) => (
                  <li
                    key={`${item.medicineName}-${item.date}-${item.time}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-xs"
                  >
                    {item.status === "taken" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 dark:text-[#36D399] shrink-0" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-500 dark:text-[#FB7185] shrink-0" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-semibold text-[var(--text)]">
                        {item.status === "taken"
                          ? (isNepali ? `${item.medicineName} खाइसकेको पुष्टि भयो।` : `${item.medicineName} confirmed as taken.`)
                          : (isNepali ? `${item.medicineName} खान बाँकी छ।` : `${item.medicineName} is not yet confirmed.`)}
                      </p>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {item.date} &bull; {formatTimeDisplay(item.time)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>


          {/* Caregiver Visit & Activity Reports */}
          <Card className="p-6 border-[#16A36A]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="icon-badge">
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="font-display text-base font-bold text-[var(--text)]">
                  {t.family.careReportsHeading}
                </h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReportModal(true)}
                className="text-xs py-1 px-2.5"
              >
                + {t.family.addCareReportBtn}
              </Button>
            </div>

            {reports.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">
                {isNepali ? "कुनै हेरचाह प्रतिवेदन पेस गरिएको छैन।" : "No care reports submitted yet."}
              </p>
            ) : (
              <ul className="space-y-3">
                {reports.slice(0, 4).map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <strong className="text-[var(--text)]">{r.patientName}</strong>
                      <span className="font-mono text-[var(--text-muted)]">
                        {r.date} &bull; {r.visitType === "call" ? t.family.callType : r.visitType === "visit" ? t.family.visitType : t.family.checkinType}
                      </span>
                    </div>
                    <div className="inline-block rounded-md bg-[#16A36A]/10 border border-[#16A36A]/20 px-2 py-0.5 text-[10px] font-bold text-[#16A36A] dark:text-[#A3EAC1] mb-1.5">
                      {r.adherenceObserved}
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                      {r.notes}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {missed.length > 0 && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500 dark:text-[#FB7185] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {isNepali
                    ? `${formatNumber(missed.length)} खुराक औषधि बिरामीले खान बाँकी छ।`
                    : `${missed.length} dose record(s) pending patient attention.`}
                </span>
              </div>
            )}
          </Card>
        </section>

        {/* Schedule Call / Visit Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md">
            <Card className="w-full max-w-md p-5 sm:p-6 bg-[var(--surface)] border border-[#16A36A]/30 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-[var(--text)]">
                  {t.family.scheduleCallOrVisitBtn}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  aria-label="Close dialog"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {isNepali ? "प्रकार" : "Event Type"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSchedType("call")}
                      className={`inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border text-center font-bold transition-all ${
                        schedType === "call"
                          ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]"
                          : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{t.family.callType}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchedType("visit")}
                      className={`inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border text-center font-bold transition-all ${
                        schedType === "visit"
                          ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]"
                          : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <Home className="h-3.5 w-3.5" />
                      <span>{t.family.visitType}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {t.family.patientLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={schedPatient}
                    onChange={(e) => setSchedPatient(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                    placeholder={isNepali ? "बिरामी वा परिवारको सदस्यको नाम" : "Patient or Family Member Name"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      {t.family.scheduleDateLabel}
                    </label>
                    <input
                      type="date"
                      required
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      {t.family.scheduleTimeLabel}
                    </label>
                    <input
                      type="time"
                      required
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {t.family.scheduleNotesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={schedNotes}
                    onChange={(e) => setSchedNotes(e.target.value)}
                    placeholder={isNepali ? "औषधिको बट्टा जाँच, पानी पिउन स्मरण, डाक्टर भेटबारे छलफल..." : "Check pillbox, remind about water intake, discuss doctor visit..."}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowScheduleModal(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    {t.family.createScheduleBtn}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Submit Care Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 bg-[var(--surface)] border border-[#16A36A]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-[var(--text)]">
                  {t.family.addCareReportBtn}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  aria-label="Close dialog"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {isNepali ? "सम्पर्क / भेटघाट प्रकार" : "Interaction Type"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["call", "visit", "checkin"] as const).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setReportType(kind)}
                        className={`p-2 rounded-xl border text-center font-bold capitalize transition-all ${
                          reportType === kind
                            ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]"
                            : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {kind === "call" ? t.family.callType : kind === "visit" ? t.family.visitType : t.family.checkinType}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {t.family.patientLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={reportPatient}
                    onChange={(e) => setReportPatient(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {t.family.adherenceObserved}
                  </label>
                  <select
                    value={reportAdherence}
                    onChange={(e) => setReportAdherence(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                  >
                    <option value="All scheduled morning doses confirmed">
                      {isNepali ? "बिहानका सबै निर्धारित औषधि खाइसकिएको पुष्टि" : "All scheduled morning doses confirmed"}
                    </option>
                    <option value="Patient confirmed taking afternoon medications">
                      {isNepali ? "दिउँसोको औषधि खाइसकिएको पुष्टि भयो" : "Patient confirmed taking afternoon medications"}
                    </option>
                    <option value="Snoozed dose taken after reminder call">
                      {isNepali ? "फोन सम्झौतापछि सारिएको औषधि खाइयो" : "Snoozed dose taken after reminder call"}
                    </option>
                    <option value="Medication refilled and organized in pillbox">
                      {isNepali ? "औषधि थप गरियो र बट्टामा मिलाएर राखियो" : "Medication refilled and organized in pillbox"}
                    </option>
                    <option value="Pending evening confirmation">
                      {isNepali ? "साँझको औषधि पुष्टि हुन बाँकी" : "Pending evening confirmation"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {t.family.notesOrObservations}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder={isNepali ? "बिरामीको अवस्था, लक्षण, खाना सम्बन्धी निर्देशन पालना भए/नभएको उल्लेख गर्नुहोस्..." : "Note patient's mood, symptoms, food directions followed, or special instructions..."}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowReportModal(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    {t.family.createReportBtn}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}

