"use client";

import { useEffect, useState } from "react";
import { Mail, ShieldCheck, UsersRound } from "lucide-react";
import type { CaregiverConnection, ConsentStatus } from "@/types";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CaregiverCard } from "@/components/family/CaregiverCard";
import { getConnections, inviteCaregiver, removeConnection, setConsent } from "@/services/caregiver-service";

export default function FamilyPage() {
  const [list, setList] = useState<CaregiverConnection[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => setList(getConnections()), []);
  const reload = () => setList(getConnections());

  return (
    <PageShell title="Family Care" subtitle="You decide who can see your dose status.">
      <div className="space-y-6">
        <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/60">
          <div className="mb-5 flex items-start gap-3">
            <span className="rounded-xl bg-teal-100 p-3 text-teal-700"><UsersRound className="h-6 w-6" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Invite a trusted caregiver</h2>
              <p className="mt-1 text-slate-600">Share updates only with someone you choose.</p>
            </div>
          </div>
          <form
            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              inviteCaregiver(email, name);
              setEmail(""); setName(""); reload();
            }}
          >
            <input aria-label="Family member name" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="min-h-12 rounded-xl border-2 border-slate-300 px-3" />
            <input aria-label="Family member email" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12 rounded-xl border-2 border-slate-300 px-3" />
            <Button type="submit">Invite</Button>
          </form>
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
            <span>Demo mode saves invitations on this device. It does not send email yet. Real email delivery needs a secure server email provider connected to Supabase.</span>
          </p>
        </Card>

        <section aria-label="Connected family">
          {list.length === 0 ? (
            <Card className="text-slate-600">No family members connected yet.</Card>
          ) : (
            <ul className="space-y-3">
              {list.map((c) => (
                <li key={c.id}>
                  <CaregiverCard
                    c={c}
                    onConsent={(id, s: ConsentStatus) => { setConsent(id, s); reload(); }}
                    onRemove={(id) => { removeConnection(id); reload(); }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card className="border-blue-100 bg-blue-50/60">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-5 w-5 text-blue-700" aria-hidden="true" /> How alerts will work</h2>
          <p className="mt-1 text-slate-700">
            If a dose is still <strong>not yet confirmed</strong> after your grace period, your caregiver is told so.
            An unconfirmed dose does not mean you missed it. You may simply not have tapped Taken.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
