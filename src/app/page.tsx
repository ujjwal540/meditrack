import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing, CheckCircle2, HeartHandshake, ShieldCheck } from "lucide-react";

const features = [
  { Icon: BellRing, title: "Gentle reminders", text: "Stay on schedule with clear, timely medication alerts." },
  { Icon: HeartHandshake, title: "Family care", text: "Keep trusted loved ones connected, with your consent." },
  { Icon: CheckCircle2, title: "Simple tracking", text: "See your progress without confusing medical language." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-blue-700 px-5 pb-20 pt-6 text-white sm:px-8 sm:pb-28 sm:pt-8">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold">
            <Image src="/logo.svg" alt="" width={42} height={42} className="rounded-xl bg-white p-1" />
            MediTrack
          </Link>
          <Link href="/login" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 sm:px-5 sm:text-base">
            Log in
          </Link>
        </header>
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-100">Healthcare, made human</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Never miss your medicine. Never care alone.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-teal-50 sm:text-xl">
              A calmer, simpler way to manage your medication routine and keep the people you trust connected.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-6 font-semibold text-teal-800 shadow-lg transition hover:bg-teal-50">
                Create your care space <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link href="/dashboard" className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/40 px-6 font-semibold transition hover:bg-white/10">
                Explore demo mode
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/30 bg-white/15 p-4 shadow-2xl backdrop-blur-md sm:p-6">
              <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-slate-500">Today&apos;s care plan</p><p className="mt-1 text-2xl font-bold">You&apos;re doing great</p></div>
                  <div className="rounded-2xl bg-teal-100 p-3 text-teal-700"><ShieldCheck className="h-7 w-7" aria-hidden="true" /></div>
                </div>
                <div className="mt-6 rounded-2xl bg-teal-50 p-4">
                  <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-600 p-2 text-white"><BellRing className="h-5 w-5" aria-hidden="true" /></span><div><p className="font-semibold">Next reminder</p><p className="text-sm text-slate-600">Morning medication · 8:00 AM</p></div></div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">Daily progress</span><strong className="text-teal-700">75%</strong></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full bg-teal-500" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="inline-flex rounded-xl bg-teal-100 p-3 text-teal-700"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-slate-500">MediTrack is a reminder and tracking tool. It does not give medical advice or change doses.</p>
      </section>
    </main>
  );
}
