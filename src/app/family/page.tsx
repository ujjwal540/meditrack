"use client";

import { useEffect, useState } from "react";
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
        <Card>
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
          <p className="mt-3 text-sm text-slate-600">
            Demo mode: invitations are stored on this device only. Real invitations and caregiver alerts arrive with Supabase (Day 3).
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

        <Card className="bg-slate-50">
          <h2 className="text-lg font-semibold">How alerts will work</h2>
          <p className="mt-1 text-slate-700">
            If a dose is still <strong>not yet confirmed</strong> after your grace period, your caregiver is told so.
            An unconfirmed dose does not mean you missed it. You may simply not have tapped Taken.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
