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
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { CaregiverConnection, ConsentStatus, Dose, DoseLog } from "@/types";
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
        setCurrentUserId(null);
        setRemoteActivity([]);
        return;
      }
      setAuthenticated(true);
      const userId = await getCurrentUserId();
      if (supabase && !userId) {
        setAuthenticated(false);
        return;
      }
      const connections = await getConnections();
      setList(connections);
      setCurrentUserId(userId);
      setRemoteActivity(await loadRemoteActivity(connections));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load family care.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const localUpdates = useMemo<RemoteActivity[]>(
    () =>
      doses
        .filter((dose) => dose.status === "taken" || dose.status === "not_confirmed")
        .slice(0, 8)
        .map((dose: Dose) => ({
          medicineName: dose.medicineName,
          dosage: dose.dosage,
          status: dose.status,
          time: dose.time,
          date: dose.date,
        })),
    [doses],
  );
  const activity = supabase ? remoteActivity : localUpdates;
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
    <PageShell title="Family Care" subtitle="Stay connected with the people who care about you.">
      <div className="section-gap">
        {error && <p role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 font-semibold text-red-800">{error}</p>}
        {!loading && supabase && !authenticated && (
          <Card className="border-2 border-amber-200 bg-amber-50">
            <h2 className="text-xl font-bold text-amber-950">Please sign in to view Family Care</h2>
            <p className="mt-2 text-amber-900">Your session has expired or is not available on this device.</p>
            <Link href="/login" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#075b43] px-5 font-bold text-white">Sign in again</Link>
          </Card>
        )}
        <section className="hero-section relative p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="icon-badge bg-white"><Heart className="h-6 w-6 fill-current text-[#78947b]" aria-hidden="true" /></span>
              <p className="font-bold uppercase tracking-[0.16em] text-[#78947b]">Care circle</p>
            </div>
            <h2 className="text-3xl font-bold text-[#355b48]">Care is closer than you think.</h2>
            <p className="mt-3 text-lg text-[#4f6857]">Invite someone you trust and decide exactly what they can see.</p>
          </div>
          <Sparkles className="absolute right-8 top-8 h-16 w-16 text-[#78947b]/50" aria-hidden="true" />
          <div className="mt-6 flex justify-center md:mt-0 md:shrink-0">
            <Image src="/images/illustrations/family-care.png" alt="Family members caring for one another" width={1212} height={792} className="illustration h-auto w-56 max-w-full" />
          </div>
        </section>

        <Card>
          <div className="mb-5 flex items-start gap-3">
            <span className="icon-badge"><UsersRound className="h-6 w-6" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl font-semibold text-[#355b48]">Invite a trusted family member</h2>
              <p className="mt-1 text-[#707a73]">They only see updates after you grant permission.</p>
            </div>
          </div>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => {
            event.preventDefault();
            if (!email.trim()) return;
            void run(async () => { await inviteCaregiver(email, name); setEmail(""); setName(""); });
          }}>
            <input aria-label="Family member name" placeholder="Name (optional)" value={name} onChange={(event) => setName(event.target.value)} className="form-input !mt-0" />
            <input aria-label="Family member email" type="email" required placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input !mt-0" />
            <Button type="submit"><Mail className="h-5 w-5" aria-hidden="true" /> Send invite</Button>
          </form>
          <p className="mt-3 flex items-start gap-2 text-sm text-[#707a73]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#355b48]" aria-hidden="true" /> Supabase Row Level Security controls who can view shared medicines and dose updates.</p>
        </Card>

        <section aria-labelledby="connections-heading">
          <h2 id="connections-heading" className="mb-3 text-2xl font-bold text-[#355b48]">Your care connections</h2>
          {loading ? <Card>Loading secure connections…</Card> : list.length === 0 ? <Card className="text-[#707a73]">No family members connected yet.</Card> : (
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

        <section aria-labelledby="updates-heading" className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <span className="icon-badge bg-[#e7f1e7]"><Bell className="h-6 w-6" aria-hidden="true" /></span>
              <h2 id="updates-heading" className="text-xl font-bold text-[#355b48]">Medicine updates</h2>
            </div>
            {activity.length === 0 ? <p className="mt-4 text-[#707a73]">No shared medicine updates yet.</p> : (
              <ul className="mt-4 space-y-3">
                {activity.slice(0, 5).map((item, index) => (
                  <li key={`${item.medicineName}-${item.date}-${item.time}-${index}`} className="flex items-start gap-3 rounded-2xl bg-[#f8f6ef] p-3">
                    {item.status === "taken" ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#355b48]" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-[#b42318]" aria-hidden="true" />}
                    <p className="text-[#26332b]">{item.status === "taken" ? `${item.medicineName} was marked as taken.` : `${item.medicineName} is not yet confirmed.`}<span className="block text-sm text-[#707a73]">{item.date} · {formatTime(item.time)}</span></p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="bg-[#fff8ed]">
            <h2 className="text-xl font-bold text-[#355b48]">Upcoming reminders</h2>
            {upcoming.length === 0 ? <p className="mt-4 text-[#707a73]">No upcoming reminders today.</p> : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((dose) => <li key={dose.key} className="rounded-2xl bg-white p-3"><strong>{dose.medicineName}</strong><span className="block text-[#707a73]">{dose.dosage} · {formatTime(dose.time)}</span></li>)}
              </ul>
            )}
            {missed.length > 0 && <p className="mt-4 rounded-2xl bg-red-50 p-3 font-semibold text-red-800"><AlertTriangle className="mr-2 inline h-5 w-5" aria-hidden="true" /> {missed.length} update{missed.length === 1 ? "" : "s"} need attention.</p>}
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
