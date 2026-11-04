"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { signOut } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageContext";

export function LogoutConfirmDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t, isNepali } = useTranslation();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!isOpen) return null;

  async function handleConfirmLogout() {
    setLoggingOut(true);
    await signOut();
    onClose();
    router.push("/login");
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in"
    >
      <Card className="relative w-full max-w-sm p-6 bg-[var(--surface)] border border-rose-500/30 shadow-2xl shadow-black/70">
        <button
          type="button"
          onClick={onClose}
          disabled={loggingOut}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
          aria-label={isNepali ? "लगआउट रद्द गर्नुहोस्" : "Cancel logout"}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-500 dark:text-[#FB7185] border border-rose-500/30">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="logout-dialog-title" className="font-display text-base font-bold text-[var(--text)]">
              {isNepali ? "मेडीट्रयाकबाट बाहिरिनुहुन्छ?" : "Sign Out of MediTrack?"}
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {isNepali ? "सत्र सुरक्षा पुष्टि" : "Session Security Confirmation"}
            </p>
          </div>
        </div>

        <p id="logout-dialog-desc" className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
          {isNepali
            ? "के तपाईं पक्का लगआउट गर्न चाहनुहुन्छ? तपाईंको स्वास्थ्य विवरण सुरक्षित राख्न यो ब्राउजरबाट तपाईंको सत्र समाप्त गरिनेछ।"
            : "Are you sure you want to log out? Your authenticated healthcare session and cached data will be cleared from this browser to keep your information secure."}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={loggingOut}
            className="text-xs"
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={handleConfirmLogout}
            disabled={loggingOut}
            className="text-xs font-bold gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            {loggingOut ? (isNepali ? "बाहिरिँदै..." : "Signing out...") : t.settings.signOutBtn}
          </Button>
        </div>
      </Card>
    </div>
  );
}

