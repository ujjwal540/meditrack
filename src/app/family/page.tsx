"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Heart,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { CaregiverConnection, ConsentStatus, DoseLog } from "@/types";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CaregiverCard } from "@/components/family/CaregiverCard";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { supabase } from "@/lib/supabase";
import {
  acceptInvitation,
  getConnections,
  getCurrentUserId,
  inviteCaregiver,
  removeConnection,
  setConsent,
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
  const { doses } = useMediTrack();
  const [list, setList] = useState<CaregiverConnection[]>([]);
  const [remoteActivity, setRemoteActivity] = useState<RemoteActivity[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

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
  const upcoming = doses.filter((dose) => dose.status === "pending").slice(0, 2);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      await reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Family action could not be completed.");
    }
  }

  return (
    <PageShell
      title="Family Care Circle"
      subtitle="Connect with trusted loved ones and manage consent-based sharing."
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
                <span>Consent-Based Care</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text)]">
                Care is closer than you think.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Invite someone you trust to receive gentle reassurance. You decide exactly when they can see your doses and can revoke access anytime.
              </p>
            </div>
            <div className="shrink-0 hidden md:block">
              <div className="relative h-28 w-28 rounded-2xl bg-[#16A36A]/10 border border-[#16A36A]/20 p-2 flex items-center justify-center">
                <Image
                  src="/images/illustrations/family-care.png"
                  alt="Family Care"
                  width={100}
                  height={100}
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
                Invite a Trusted Family Member
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                They will only be able to view updates after you explicitly grant permission.
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
              placeholder="Name (optional)"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#16A36A] focus:outline-none"
            />
            <input
              aria-label="Family member email"
              type="email"
              required
              placeholder="Email address (e.g. daughter@example.com)"
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
            <span>Encrypted access: Patient permissions govern who views dose logs.</span>
          </p>
        </Card>

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

        {/* Live Shared Activity & Upcoming Preview */}
        <section aria-labelledby="updates-heading" className="grid gap-6 lg:grid-cols-2">
          {/* Medicine Updates Feed */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="icon-badge">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="updates-heading" className="font-display text-base font-bold text-[var(--text)]">
                Recent Care Feed
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

          {/* Upcoming Reminders Card */}
          <Card className="p-6 border-[#16A36A]/20">
            <h2 className="font-display text-base font-bold text-[var(--text)] mb-4">
              Upcoming Today
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No additional reminders pending today.</p>
            ) : (
              <ul className="space-y-2.5">
                {upcoming.map((dose) => (
                  <li
                    key={dose.key}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-xs"
                  >
                    <div>
                      <strong className="block text-[var(--text)]">{dose.medicineName}</strong>
                      <span className="text-[11px] text-[var(--text-muted)]">{dose.dosage}</span>
                    </div>
                    <span className="font-mono font-bold text-[#16A36A] dark:text-[#20C982]">{formatTime(dose.time)}</span>
                  </li>
                ))}
              </ul>
            )}

            {missed.length > 0 && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500 dark:text-[#FB7185] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{missed.length} dose record(s) pending attention.</span>
              </div>
            )}
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
