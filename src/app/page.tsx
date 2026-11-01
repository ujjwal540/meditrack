import Image from "next/image";
import Link from "next/link";
import { BellRing, FileText, LineChart, Users } from "lucide-react";

const features = [
  { Icon: BellRing, title: "Smart reminders", text: "Never wonder whether you took your dose." },
  { Icon: FileText, title: "Prescription upload", text: "Keep your prescription next to your schedule." },
  { Icon: LineChart, title: "Adherence dashboard", text: "See your daily and weekly progress." },
  { Icon: Users, title: "Family Care Mode", text: "Share dose status with family you choose." },
];

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-b from-teal-50 to-surface px-4 py-16 text-center">
        <Image src="/logo.svg" alt="" width={72} height={72} className="mx-auto" />
        <h1 className="mt-4 text-5xl font-extrabold text-slate-900">MediTrack</h1>
        <p className="mt-3 text-2xl text-slate-700">Never Miss Your Medicine. Never Care Alone.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="inline-flex min-h-14 items-center rounded-xl bg-primary px-8 text-lg font-semibold text-white hover:bg-teal-700">
            Open dashboard
          </Link>
          <Link href="/register" className="inline-flex min-h-14 items-center rounded-xl border-2 border-slate-300 bg-white px-8 text-lg font-semibold hover:bg-slate-100">
            Create account
          </Link>
          <Link href="/login" className="inline-flex min-h-14 items-center rounded-xl px-8 text-lg font-semibold text-secondary hover:underline">
            Log in
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-slate-600">{text}</p>
          </div>
        ))}
      </section>
      <p className="px-4 pb-10 text-center text-sm text-slate-500">
        MediTrack is a reminder and tracking tool. It does not give medical advice or change doses.
      </p>
    </main>
  );
}
