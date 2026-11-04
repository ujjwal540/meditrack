"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, KeyRound, Lock, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { changeUserPassword } from "@/lib/auth";

export function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Real-time validation checks
  const isMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = isMinLength && hasLetter && hasNumber && isMatching;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isMinLength) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (!hasLetter || !hasNumber) {
      setError("New password must contain both letters and numbers.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await changeUserPassword(currentPassword, newPassword);
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } else {
      setError(res.error || "Failed to update password. Please check your current password.");
    }
  }

  function handleClose() {
    setError(null);
    setSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  }

  const inputStyle =
    "w-full min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] pl-10 pr-10 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20 transition-all font-mono";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in"
    >
      <Card className="relative w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 bg-[var(--surface)] border border-[#16A36A]/30 shadow-2xl shadow-black/60">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20C982] border border-[#16A36A]/30">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="change-password-title" className="font-display text-lg font-bold text-[var(--text)]">
              Change Password
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Update your account password securely using Supabase Auth.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div
            role="status"
            className="mb-4 flex items-center gap-2.5 rounded-xl border border-[#16A36A]/40 bg-[#16A36A]/15 p-3.5 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Password updated successfully! Closing...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500 dark:text-[#FB7185] leading-relaxed"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Current Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new secure password"
                className={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide new password" : "Show new password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Live Validation Checklist */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 space-y-1.5 text-[11px]">
            <p className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] mb-1">
              Security Requirements:
            </p>
            <div className={`flex items-center gap-2 ${isMinLength ? "text-[#16A36A] dark:text-[#20C982]" : "text-[var(--text-muted)]"}`}>
              <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${isMinLength ? "bg-[#16A36A]/20" : "bg-[var(--border)]"}`}>
                {isMinLength ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : "·"}
              </span>
              <span>Minimum 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasLetter && hasNumber ? "text-[#16A36A] dark:text-[#20C982]" : "text-[var(--text-muted)]"}`}>
              <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${hasLetter && hasNumber ? "bg-[#16A36A]/20" : "bg-[var(--border)]"}`}>
                {hasLetter && hasNumber ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : "·"}
              </span>
              <span>Contains letters and numbers</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatching ? "text-[#16A36A] dark:text-[#20C982]" : "text-[var(--text-muted)]"}`}>
              <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${isMatching ? "bg-[#16A36A]/20" : "bg-[var(--border)]"}`}>
                {isMatching ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : "·"}
              </span>
              <span>New passwords match</span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={loading || !isValid}
              className="text-xs font-bold px-5"
            >
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
