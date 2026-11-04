"use client";

import { CheckCircle2, ShieldCheck, Trash2, UserCheck, XCircle } from "lucide-react";
import type { CaregiverConnection, ConsentStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/i18n/LanguageContext";

export function CaregiverCard({
  c,
  isIncoming = false,
  onAccept,
  onConsent,
  onRemove,
}: {
  c: CaregiverConnection;
  isIncoming?: boolean;
  onAccept?: (id: string) => void;
  onConsent: (id: string, s: ConsentStatus) => void;
  onRemove: (id: string) => void;
}) {
  const { t, isNepali } = useTranslation();
  const initials = (c.caregiverName || c.caregiverEmail).slice(0, 2).toUpperCase();

  const statusLabel: Record<ConsentStatus, { text: string; color: string }> = {
    invited: {
      text: t.family.consentInvited,
      color: "bg-amber-500/10 text-amber-500 dark:text-[#FBBF24] border-amber-500/25",
    },
    accepted: {
      text: t.family.consentPending,
      color: "bg-blue-500/10 text-blue-500 dark:text-[#60A5FA] border-blue-500/25",
    },
    granted: {
      text: t.family.consentGranted,
      color: "bg-emerald-500/10 text-emerald-500 dark:text-[#36D399] border-emerald-500/25",
    },
    revoked: {
      text: isNepali ? "साझेदारी रोकियो" : "Sharing Paused",
      color: "bg-slate-500/10 text-slate-500 dark:text-[#708477] border-slate-500/25",
    },
  };

  const statusInfo = statusLabel[c.consentStatus];

  return (
    <Card interactive={true} className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3.5 min-w-0 flex-1 basis-56">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] to-[#20C982] font-display text-sm font-bold text-white shadow-sm"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-[var(--text)]">
            {c.caregiverName || c.caregiverEmail}
          </p>
          <p className="truncate text-xs text-[var(--text-secondary)]">{c.caregiverEmail}</p>
          <div className="mt-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.color}`}
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              <span>{statusInfo.text}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {isIncoming && c.consentStatus === "invited" && onAccept && (
          <Button size="sm" variant="primary" onClick={() => onAccept(c.id)}>
            <CheckCircle2 className="h-3.5 w-3.5" /> {isNepali ? "निमन्त्रणा स्वीकार्नुहोस्" : "Accept Invitation"}
          </Button>
        )}
        {c.consentStatus === "invited" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConsent(c.id, "accepted")}
            className="text-xs py-1 px-3"
          >
            {isNepali ? "स्वीकृति परीक्षण" : "Simulate Acceptance"}
          </Button>
        )}
        {c.consentStatus === "accepted" && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onConsent(c.id, "granted")}
            className="text-xs py-1 px-3"
          >
            <UserCheck className="h-3.5 w-3.5" /> {t.family.grantAccessBtn}
          </Button>
        )}
        {c.consentStatus === "granted" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConsent(c.id, "revoked")}
            className="text-xs py-1 px-3 text-amber-500 dark:text-[#FBBF24] border-amber-500/25"
          >
            <XCircle className="h-3.5 w-3.5" /> {t.family.revokeAccessBtn}
          </Button>
        )}
        <Button
          size="sm"
          variant="danger"
          aria-label={`${t.family.removeConnectionBtn} ${c.caregiverEmail}`}
          title={t.family.removeConnectionBtn}
          onClick={() => onRemove(c.id)}
          className="text-xs py-1 px-3"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}