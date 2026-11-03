"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Heart,
  HeartPulse,
  Pill,
  Users,
  Volume2,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { NextMedicineCard } from "@/components/dashboard/NextMedicineCard";
import { DoseList } from "@/components/reminders/DoseList";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useVoice } from "@/hooks/use-voice";
import { formatTime } from "@/utils/date-utils";

const TILES = [
  {
    href: "/medicines",
    label: "Medicines",
    hint: "Manage prescriptions & dosages",
    Icon: Pill,
    glow: "group-hover:border-[#16A36A]/40 group-hover:shadow-[0_0_20px_rgba(22,163,106,0.18)]",
    badgeBg: "bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]",
  },
  {
    href: "/schedule",
    label: "Timetable",
    hint: "View daily chronological schedule",
    Icon: CalendarDays,
    glow: "group-hover:border-[#20C982]/40 group-hover:shadow-[0_0_20px_rgba(32,201,130,0.18)]",
    badgeBg: "bg-[#20C982]/15 text-[#20C982]",
  },
  {
    href: "/health",
    label: "Health Stats",
    hint: "Weekly adherence & trends",
    Icon: HeartPulse,
    glow: "group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(54,211,153,0.18)]",
    badgeBg: "bg-emerald-500/15 text-emerald-500 dark:text-[#36D399]",
  },
  {
    href: "/family",
    label: "Family Care",
    hint: "Connected caregivers & circle",
    Icon: Users,
    glow: "group-hover:border-[#A78BFA]/40 group-hover:shadow-[0_0_20px_rgba(167,139,250,0.18)]",
    badgeBg: "bg-[#A78BFA]/15 text-[#A78BFA]",
  },
];

export default function DashboardPage() {
  const {
    ready,
    now,
    doses,
    stats,
    nextDose,
    dueDoses,
    settings,
    respond,
    notificationPermission,
    requestNotifications,
  } = useMediTrack();
  const { speak } = useVoice();

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const name = "Friend";
  const target = dueDoses[0] ?? nextDose;
  const pct = stats.total ? Math.round((stats.taken / stats.total) * 100) : 0;
  const remaining = stats.total - stats.taken;

  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const summary =
    stats.total === 0
      ? `Hello ${name}. You have no medicines scheduled today.`
      : `${greeting}, ${name}. You have ${remaining} ${remaining === 1 ? "medicine" : "medicines"} remaining today.` +
        (nextDose
          ? ` Your next medicine reminder is at ${formatTime(nextDose.time)}.`
          : "");

  return (
    <PageShell bare>
      {!ready ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
          <div className="skeleton h-44" />
          <div className="skeleton h-40" />
          <div className="skeleton h-64" />
        </div>
      ) : (
        <div className="space-y-7">
          {/* Hero Greeting Section */}
          <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface-elevated)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#16A36A]/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#A78BFA]/10 blur-3xl" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#20C982] shadow-[0_0_8px_#20C982]" />
                  <span>{dateFormatted}</span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
                  {greeting}, <span className="text-[#16A36A] dark:text-[#A3EAC1]">{name}</span>
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-[var(--text-secondary)] max-w-lg">
                  MediTrack is active. Your treatment routine is synchronized across your devices.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speak(summary, true)}
                  className="rounded-full text-xs"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  <span>Read aloud</span>
                </Button>

                <button
                  type="button"
                  onClick={requestNotifications}
                  aria-label={
                    notificationPermission === "granted"
                      ? "Notifications are on"
                      : "Turn on notifications"
                  }
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[#16A36A] dark:text-[#20C982] transition-all hover:border-[#16A36A]/50 hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          {/* Reminder permission alert if default */}
          {notificationPermission === "default" && (
            <Card className="flex flex-wrap items-center justify-between gap-4 border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-300">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-amber-100">
                    Enable browser alerts
                  </p>
                  <p className="text-xs text-slate-600 dark:text-amber-200/80">
                    Receive instant notifications right when your medicine is due.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="accent" onClick={requestNotifications}>
                Turn on alerts
              </Button>
            </Card>
          )}

          {/* Daily Adherence Progress Overview */}
          <Card className="flex flex-wrap items-center gap-6 sm:gap-8 p-6 sm:p-7">
            <ProgressRing value={pct} size={140} stroke={12}>
              <div className="font-mono text-3xl font-extrabold tracking-tight text-[var(--text)] tabular-nums">
                {pct}%
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Adherence
              </div>
            </ProgressRing>

            <div className="min-w-0 flex-1 basis-64">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  Daily Overview
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-[var(--text)]">
                Today&apos;s Medications
              </h2>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2">
                  <span className="text-[11px] text-[var(--text-muted)] block">Completed</span>
                  <span className="font-mono text-base font-bold text-emerald-500 dark:text-[#36D399] tabular-nums">
                    {stats.taken} of {stats.total}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2">
                  <span className="text-[11px] text-[var(--text-muted)] block">Remaining</span>
                  <span className="font-mono text-base font-bold text-amber-500 dark:text-[#FBBF24] tabular-nums">
                    {remaining} doses
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2">
                  <span className="text-[11px] text-[var(--text-muted)] block">Next Scheduled</span>
                  <span className="font-mono text-base font-bold text-[#16A36A] dark:text-[#20C982] tabular-nums">
                    {nextDose ? formatTime(nextDose.time) : "None remaining"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Priority Next Medicine Card */}
          <NextMedicineCard
            dose={target}
            snoozeMinutes={settings.snoozeMinutes}
            onTaken={(k) => {
              respond(k, "taken");
              speak("Your medicine has been marked as taken.");
            }}
            onLater={(k) => {
              respond(k, "snoozed", settings.snoozeMinutes);
              speak(`Okay. I will remind you in ${settings.snoozeMinutes} minutes.`);
            }}
          />

          {/* Today's Schedule Timeline */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
                  Today&apos;s Schedule
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Chronological doses ordered by time period
                </p>
              </div>
              <Link
                href="/schedule"
                className="text-xs font-semibold text-[#16A36A] dark:text-[#20C982] hover:underline flex items-center gap-1"
              >
                <span>Full timetable</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <DoseList doses={doses} onRespond={(k, s) => respond(k, s)} />
          </section>

          {/* Quick Action Tiles */}
          <section aria-label="Quick Actions">
            <h2 className="mb-3.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {TILES.map(({ href, label, hint, Icon, glow, badgeBg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-[var(--shadow-card)] ${glow}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] ${badgeBg}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4">
                    <span className="block font-display text-base font-bold text-[var(--text)]">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--text-muted)] truncate">
                      {hint}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Health Encouragement Card */}
          <Card className="flex items-center gap-4 border-[#16A36A]/25 bg-gradient-to-r from-[#16A36A]/15 via-[var(--surface-elevated)] to-[var(--surface)] p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/30">
              <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">
              Consistency is the foundation of well-being. Every confirmed dose protects your health routine.
            </p>
          </Card>
        </div>
      )}
    </PageShell>
  );
}