"use client";

import { ShieldCheck, Trash2 } from "lucide-react";
import type { CaregiverConnection, ConsentStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const LABEL: Record<ConsentStatus, string> = {
  invited: "Invitation sent",
  accepted: "Accepted – waiting for your consent",
  granted: "Sharing enabled",
  revoked: "Sharing stopped",
};

export function CaregiverCard({
  c,
  onConsent,
  onRemove,
}: {
  c: CaregiverConnection;
  onConsent: (id: string, s: ConsentStatus) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold">{c.caregiverName || c.caregiverEmail}</p>
        <p className="text-slate-600">{c.caregiverEmail}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {LABEL[c.consentStatus]}
        </p>
      </div>
      {c.consentStatus === "invited" && (
        <Button variant="outline" onClick={() => onConsent(c.id, "accepted")}>Simulate: they accepted</Button>
      )}
      {c.consentStatus === "accepted" && (
        <Button onClick={() => onConsent(c.id, "granted")}>Allow them to see my doses</Button>
      )}
      {c.consentStatus === "granted" && (
        <Button variant="outline" onClick={() => onConsent(c.id, "revoked")}>Stop sharing</Button>
      )}
      <Button variant="danger" aria-label={`Remove ${c.caregiverEmail}`} onClick={() => onRemove(c.id)}>
        <Trash2 className="h-5 w-5" aria-hidden="true" />
      </Button>
    </Card>
  );
}
