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
import { StatCards } from "@/components/dashboard/StatCards";
import { DoseList } from "@/components/reminders/DoseList";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useVoice } from "@/hooks/use-voice";
import { useTranslation } from "@/i18n/LanguageContext";
import { getPersonalizedGreeting } from "@/utils/greeting";

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
    userName,
  } = useMediTrack();
  const { speak } = useVoice();
  const { t, language, isNepali, formatNumber, formatTimeDisplay } = useTranslation();

  const greetingData = getPersonalizedGreeting(userName, now, language);
  const target = dueDoses[0] ?? nextDose;
  const pct = stats.total ? Math.round((stats.taken / stats.total) * 100) : 0;
  const remaining = stats.total - stats.taken;

  const dateFormatted = now.toLocaleDateString(isNepali ? "ne-NP" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const summary = isNepali
    ? stats.total === 0
      ? greetingData.hasName
        ? `नमस्ते ${greetingData.name}! आज तपाईंको कुनै औषधि खान बाँकी छैन।`
        : "नमस्ते! आज तपाईंको कुनै औषधि खान बाँकी छैन।"
      : `${greetingData.greeting} आज तपाईंको ${formatNumber(remaining)} खुराक औषधि खान बाँकी छ।` +
        (nextDose
          ? ` अर्को औषधि खाने समय ${formatTimeDisplay(nextDose.time)} मा छ।`
          : "")
    : stats.total === 0
      ? greetingData.hasName
        ? `Hello ${greetingData.name}. You have no medicines scheduled today.`
        : "Hello. You have no medicines scheduled today."
      : `${greetingData.greeting} You have ${remaining} ${remaining === 1 ? "medicine" : "medicines"} remaining today.` +
        (nextDose
          ? ` Your next medicine reminder is at ${formatTimeDisplay(nextDose.time)}.`
          : "");

  const tiles = [
    {
      href: "/medicines",
      label: t.nav.medicines,
      hint: isNepali ? "प्रेस्क्रिप्शन र डोज व्यवस्थापन" : "Manage prescriptions & dosages",
      Icon: Pill,
      glow: "group-hover:border-[#20D6C2] group-hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_20px_rgba(32,214,194,0.32)] group-hover:bg-[var(--surface-hover)]",
      badgeBg: "bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] group-hover:bg-[#20D6C2]/20 group-hover:text-[#20D6C2]",
    },
    {
      href: "/schedule",
      label: t.nav.timetable,
      hint: isNepali ? "दैनिक औषधि समय तालिका" : "View daily chronological schedule",
      Icon: CalendarDays,
      glow: "group-hover:border-[#20D6C2] group-hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_20px_rgba(32,214,194,0.32)] group-hover:bg-[var(--surface-hover)]",
      badgeBg: "bg-[#20C982]/15 text-[#20C982] group-hover:bg-[#20D6C2]/20 group-hover:text-[#20D6C2]",
    },
    {
      href: "/health",
      label: t.nav.healthStats,
      hint: isNepali ? "हप्ताको औषधि नियमितता" : "Weekly adherence & trends",
      Icon: HeartPulse,
      glow: "group-hover:border-[#20D6C2] group-hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_20px_rgba(32,214,194,0.32)] group-hover:bg-[var(--surface-hover)]",
      badgeBg: "bg-emerald-500/15 text-emerald-500 dark:text-[#36D399] group-hover:bg-[#20D6C2]/20 group-hover:text-[#20D6C2]",
    },
    {
      href: "/family",
      label: t.nav.familyCare,
      hint: isNepali ? "परिवार तथा हेरचाहकर्ता" : "Connected caregivers & circle",
      Icon: Users,
      glow: "group-hover:border-[#20D6C2] group-hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_20px_rgba(32,214,194,0.32)] group-hover:bg-[var(--surface-hover)]",
      badgeBg: "bg-[#A78BFA]/15 text-[#A78BFA] group-hover:bg-[#20D6C2]/20 group-hover:text-[#20D6C2]",
    },
  ];

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
                <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)]">
                  {greetingData.hasName ? (
                    <>
                      {greetingData.timeGreeting},{" "}
                      <span className="text-[#16A36A] dark:text-[#A3EAC1]">
                        {greetingData.name}!
                      </span>
                    </>
                  ) : (
                    <>
                      {isNepali ? (
                        <>
                          <span className="text-[#16A36A] dark:text-[#A3EAC1]">
                            मेडीट्रयाक
                          </span>
                          मा स्वागत छ
                        </>
                      ) : (
                        <>
                          Welcome to{" "}
                          <span className="text-[#16A36A] dark:text-[#A3EAC1]">
                            MediTrack
                          </span>
                        </>
                      )}
                    </>
                  )}
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-[var(--text-secondary)] max-w-lg">
                  {greetingData.subtitle}
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
                  <span>{t.common.readAloud}</span>
                </Button>

                <button
                  type="button"
                  onClick={requestNotifications}
                  aria-label={
                    notificationPermission === "granted"
                      ? t.settings.alertsEnabledBtn
                      : t.settings.requestAlertsBtn
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
                    {t.dashboard.alertBannerTitle}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-amber-200/80">
                    {t.dashboard.alertBannerDesc}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="accent" onClick={requestNotifications}>
                {t.dashboard.turnOnAlerts}
              </Button>
            </Card>
          )}

          {/* Quick Metrics Statistics Strip */}
          <StatCards
            total={stats.total}
            taken={stats.taken}
            pending={remaining}
          />

          {/* Daily Adherence Progress Overview */}
          <Card className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 p-5 sm:p-7">
            <ProgressRing value={pct} size={140} stroke={12}>
              <div className="font-mono text-3xl font-extrabold tracking-tight text-[var(--text)] tabular-nums">
                {formatNumber(pct)}%
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {isNepali ? "नियमितता" : "Adherence"}
              </div>
            </ProgressRing>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  {t.dashboard.todayAdherence}
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[var(--text)]">
                {isNepali ? "आजका औषधिहरू" : "Today's Medications"}
              </h2>
              <div className="mt-3.5 flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-sm">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2 text-left">
                  <span className="text-[11px] text-[var(--text-muted)] block">{t.common.completed}</span>
                  <span className="font-mono text-base font-bold text-emerald-500 dark:text-[#36D399] tabular-nums">
                    {formatNumber(stats.taken)} / {formatNumber(stats.total)}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2 text-left">
                  <span className="text-[11px] text-[var(--text-muted)] block">{t.common.pending}</span>
                  <span className="font-mono text-base font-bold text-amber-500 dark:text-[#FBBF24] tabular-nums">
                    {formatNumber(remaining)} {isNepali ? "खुराक" : "doses"}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2 text-left">
                  <span className="text-[11px] text-[var(--text-muted)] block">{isNepali ? "अर्को खाने समय" : "Next Scheduled"}</span>
                  <span className="font-mono text-base font-bold text-[#16A36A] dark:text-[#20C982] tabular-nums">
                    {nextDose ? formatTimeDisplay(nextDose.time) : (isNepali ? "बाँकी छैन" : "None remaining")}
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
              speak(
                isNepali
                  ? "औषधि खाएको जनाइयो। धन्यवाद।"
                  : "Your medicine has been marked as taken.",
              );
            }}
            onLater={(k) => {
              respond(k, "snoozed", settings.snoozeMinutes);
              speak(
                isNepali
                  ? `हुन्छ। म तपाईंलाई ${formatNumber(settings.snoozeMinutes)} मिनेट पछि फेरि सम्झाउनेछु।`
                  : `Okay. I will remind you in ${settings.snoozeMinutes} minutes.`,
              );
            }}
          />

          {/* Today's Schedule Timeline */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
                  {t.dashboard.todaysScheduleHeader}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isNepali
                    ? "समय अनुसार मिलाइएको औषधिको तालिका"
                    : "Chronological doses ordered by time period"}
                </p>
              </div>
              <Link
                href="/schedule"
                className="text-xs font-semibold text-[#16A36A] dark:text-[#20C982] hover:underline flex items-center gap-1"
              >
                <span>{t.dashboard.viewTimetable}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <DoseList doses={doses} onRespond={(k, s) => respond(k, s)} />
          </section>

          {/* Quick Action Tiles */}
          <section aria-label="Quick Actions">
            <h2 className="mb-3.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
              {isNepali ? "द्रुत कार्यहरू" : "Quick Actions"}
            </h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {tiles.map(({ href, label, hint, Icon, glow, badgeBg }) => (
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
              {isNepali
                ? "नियमितता नै स्वास्थ्यको आधार हो। समयमै औषधि खाँदा सधैं स्वस्थ रहन मद्दत पुग्छ।"
                : "Consistency is the foundation of well-being. Every confirmed dose protects your health routine."}
            </p>
          </Card>
        </div>
      )}
    </PageShell>
  );
}