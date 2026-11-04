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
import { formatTime } from "@/utils/date-utils";
import Image from "next/image";
import { waitForSupabaseAuth } from "@/lib/supabase";

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
  const [list, setList] = useState<CaregiverConnection[]>([]);
  const [remoteActivity, setRemoteActivity] = useState<RemoteActivity[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

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
      date: "Today",
    }));
  }, [remoteActivity, doses]);

  const missed = activity.filter((item) => item.status === "not_confirmed");
  const upcoming = doses.filter((dose) => dose.status === "pending").slice(0, 3);

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
      date: "Today",
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
      title={isCaregiver ? "Caregiver Support Workspace" : "Family Care Circle"}
      subtitle={
        isCaregiver
          ? (userName ? `Care coordination dashboard for ${userName}. Review patient check-ins and schedules.` : "Care coordination dashboard. Review patient check-ins and schedules.")
          : "Connect with trusted loved ones, monitor doses, and coordinate care visits."
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
              Sign in to view active Care Circle
            </h2>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-200/80">
              Your remote session is not active on this device.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-4 text-xs font-bold text-white shadow-sm hover:brightness-105"
            >
              Sign In
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
                    ? (userName ? `Caregiver: ${userName}` : "Caregiver Coordination Portal")
                    : "Consent-Based Care Coordination"}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                {isCaregiver
                  ? (userName ? `Welcome back, ${userName}!` : "Caregiver Coordination Workspace")
                  : (userName ? `Welcome to your Care Circle, ${userName}` : "Care is closer than you think.")}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Connect family members and caregivers for reassuring visibility. Schedule regular check-in calls, coordinate home visits, and log real-time care updates with complete consent control.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs font-bold"
                >
                  <CalendarDays className="h-4 w-4" /> Schedule Call / Visit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReportModal(true)}
                  className="text-xs font-semibold"
                >
                  <Send className="h-4 w-4" /> Submit Care Report
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

        {/* Invite Form Card */}
        <Card className="p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-badge">
              <UsersRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                Invite a Trusted Caregiver
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Family members only receive medication updates after you explicitly grant consent.
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
              aria-label="Family member name"
              placeholder="Name (e.g. Sarah / Daughter)"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#16A36A] focus:outline-none"
            />
            <input
              aria-label="Family member email"
              type="email"
              required
              placeholder="Email address (e.g. sarah@example.com)"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#16A36A] focus:outline-none"
            />
            <Button type="submit" size="sm" variant="primary" className="text-xs px-5">
              <Mail className="h-4 w-4" aria-hidden="true" /> Send Invite
            </Button>
          </form>
          <p className="mt-3.5 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" aria-hidden="true" />
            <span>Encrypted access: Patient permissions govern who views dose logs. Access can be paused or revoked at any time.</span>
          </p>
        </Card>

        {/* Scheduled Calls & Patient Visits Section */}
        <section aria-labelledby="schedules-heading">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 id="schedules-heading" className="font-display text-xl font-bold tracking-tight text-[var(--text)]">
                Scheduled Check-Ins &amp; Home Visits ({schedules.length})
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Caregivers can coordinate routine check-in calls and in-person patient visits.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule New</span>
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
                      <span className="capitalize">{item.type} Scheduled</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.status}
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
                      <Clock className="h-3 w-3 text-[var(--text-muted)]" /> {formatTime(item.time)}
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
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  )}
                  {item.type === "call" && (
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <PhoneCall className="h-3.5 w-3.5 text-[#16A36A]" /> Voice Call
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
              Connected Caregivers ({list.length})
            </h2>
          </div>
          {loading ? (
            <div className="skeleton h-28" />
          ) : list.length === 0 ? (
            <Card className="text-center p-8 border border-dashed border-[var(--border)]">
              <UsersRound className="mx-auto h-10 w-10 text-[var(--text-muted)] opacity-60" />
              <p className="mt-2 text-xs text-[var(--text-secondary)]">No family members connected yet. Send an invite above.</p>
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
                Recent Medication Feed
              </h2>
            </div>
            {activity.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No recent medicine activity logged.</p>
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
                          ? `${item.medicineName} confirmed as taken.`
                          : `${item.medicineName} is not yet confirmed.`}
                      </p>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {item.date} &bull; {formatTime(item.time)}
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
                  Care Reports &amp; Visit Notes
                </h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReportModal(true)}
                className="text-xs py-1 px-2.5"
              >
                + Add Report
              </Button>
            </div>

            {reports.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No care reports submitted yet.</p>
            ) : (
              <ul className="space-y-3">
                {reports.slice(0, 4).map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <strong className="text-[var(--text)]">{r.patientName}</strong>
                      <span className="font-mono text-[var(--text-muted)]">{r.date} &bull; {r.visitType}</span>
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
                <span>{missed.length} dose record(s) pending patient attention.</span>
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
                  Schedule Patient Call or Visit
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
                    Event Type
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
                      <span>Phone Call</span>
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
                      <span>Home Visit</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={schedPatient}
                    onChange={(e) => setSchedPatient(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                    placeholder="Patient or Family Member Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Date
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
                      Time
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
                    Care Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={schedNotes}
                    onChange={(e) => setSchedNotes(e.target.value)}
                    placeholder="Check pillbox, remind about water intake, discuss doctor visit..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    Save Schedule
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
                  Submit Care Report &amp; Update
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
                    Interaction Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["call", "visit", "checkin"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setReportType(t)}
                        className={`p-2 rounded-xl border text-center font-bold capitalize transition-all ${
                          reportType === t
                            ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]"
                            : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Patient Name
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
                    Adherence Status Observed
                  </label>
                  <select
                    value={reportAdherence}
                    onChange={(e) => setReportAdherence(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none"
                  >
                    <option value="All scheduled morning doses confirmed">All scheduled morning doses confirmed</option>
                    <option value="Patient confirmed taking afternoon medications">Patient confirmed taking afternoon medications</option>
                    <option value="Snoozed dose taken after reminder call">Snoozed dose taken after reminder call</option>
                    <option value="Medication refilled and organized in pillbox">Medication refilled and organized in pillbox</option>
                    <option value="Pending evening confirmation">Pending evening confirmation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Observations &amp; Caregiver Notes
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Note patient's mood, symptoms, food directions followed, or special instructions..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text)] focus:border-[#16A36A] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    Submit Care Update
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
