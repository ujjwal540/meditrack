"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  KeyRound,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { LogoutConfirmDialog } from "@/components/profile/LogoutConfirmDialog";
import {
  AccountManagementModal,
  type AccountTab,
} from "@/components/profile/AccountManagementModal";

export interface ProfileDropdownProps {
  user: { id: string; name?: string; email?: string; role: UserRole } | null;
  direction?: "up" | "down";
  compact?: boolean;
  className?: string;
  onUserUpdated?: (user: { id: string; name?: string; email?: string; role: UserRole }) => void;
}

export function ProfileDropdown({
  user,
  direction = "down",
  compact = false,
  className,
  onUserUpdated,
}: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<AccountTab | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const roleBadge =
    user?.role === "professional_caregiver"
      ? "Care Pro"
      : user?.role === "family_caregiver"
        ? "Family Care"
        : user?.role === "admin"
          ? "Admin"
          : "Patient";

  function handleAction(action: () => void) {
    setIsOpen(false);
    action();
  }

  const menuItems = [
    {
      id: "overview",
      label: "Profile Overview",
      description: "View personal information",
      icon: User,
      onClick: () => setAccountModalTab("overview"),
    },
    {
      id: "account",
      label: "My Account",
      description: "Manage name & contact details",
      icon: UserCheck,
      onClick: () => setAccountModalTab("account"),
    },
    {
      id: "settings",
      label: "Settings",
      description: "Manage application preferences",
      icon: Settings,
      onClick: () => router.push("/settings"),
    },
    {
      id: "change-password",
      label: "Change Password",
      description: "Securely update your password",
      icon: KeyRound,
      onClick: () => setShowPasswordModal(true),
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Audio & reminder preferences",
      icon: Bell,
      onClick: () => setAccountModalTab("notifications"),
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      description: "Data isolation & session security",
      icon: ShieldCheck,
      onClick: () => setAccountModalTab("privacy"),
    },
    {
      id: "help",
      label: "Help & Support",
      description: "Clinical guidelines & FAQ",
      icon: HelpCircle,
      onClick: () => setAccountModalTab("help"),
    },
  ];

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id="profile-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User profile and account menu"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-2xl border transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20D6C2]",
          compact
            ? "p-1.5 border-[var(--border)] bg-[var(--surface-elevated)]/80 hover:border-[#20D6C2] hover:shadow-[0_0_16px_rgba(32,214,194,0.25)]"
            : "w-full p-2.5 border-[var(--border)] bg-[var(--surface-elevated)]/60 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(32,214,194,0.2)]",
          isOpen && "border-[#20D6C2] bg-[#16A36A]/15 shadow-[0_0_18px_rgba(32,214,194,0.3)]",
        )}
      >
        {/* Avatar Circle with Online Status Indicator */}
        <div className="relative shrink-0">
          <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] via-[#10B981] to-[#20D6C2] text-white text-xs font-extrabold shadow-sm">
            {initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-[#20D6C2] shadow-[0_0_6px_#20D6C2]"
            aria-hidden="true"
          />
        </div>

        {/* User Details (if not compact) */}
        {!compact && (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-display text-xs font-bold text-[var(--text)] group-hover:text-[#20D6C2] transition-colors">
              {user?.name || "Patient Member"}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[100px]">
                {user?.email || "Active User"}
              </span>
              <span className="shrink-0 rounded bg-[#16A36A]/20 px-1 py-0.2 text-[9px] font-bold uppercase text-[#16A36A] dark:text-[#A3EAC1]">
                {roleBadge}
              </span>
            </div>
          </div>
        )}

        {/* Dropdown Indicator Icon */}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:text-[var(--text)]",
            isOpen && (direction === "up" ? "-rotate-180" : "rotate-180"),
          )}
          aria-hidden="true"
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu-button"
          className={cn(
            "absolute z-50 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] p-2 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all animate-scale-in",
            direction === "up"
              ? "bottom-full left-0 mb-2"
              : "top-full right-0 mt-2",
          )}
        >
          {/* Top Section: User Name, Email, Profile Picture */}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 mb-1.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] to-[#20D6C2] text-white text-sm font-black shadow-md shadow-[#16A36A]/30">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="truncate font-display text-xs font-bold text-[var(--text)]">
                  {user?.name || "Patient Member"}
                </h3>
                <span className="shrink-0 rounded-md border border-[#16A36A]/30 bg-[#16A36A]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  {roleBadge}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--text-muted)]">
                {user?.email || "No email linked"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#20D6C2] shadow-[0_0_6px_#20D6C2]" />
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                  Protected Healthcare Session
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="space-y-0.5 py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleAction(item.onClick)}
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all duration-150",
                    "hover:bg-[var(--surface-hover)] hover:text-[var(--text)] hover:shadow-sm focus-visible:outline-none focus-visible:bg-[var(--surface-hover)]",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-[#20D6C2] group-hover:border-[#20D6C2]/40 transition-colors">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-[var(--text)] group-hover:text-[#20D6C2] transition-colors truncate">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-[var(--text-muted)] truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* Separator Divider */}
          <div className="my-1.5 border-t border-[var(--border)]" />

          {/* Logout Option (Styled in subtle red as recommended) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(() => setShowLogoutDialog(true))}
            className={cn(
              "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all duration-150",
              "text-rose-500 dark:text-[#FB7185] hover:bg-rose-500/10 hover:border hover:border-rose-500/20 focus-visible:outline-none focus-visible:bg-rose-500/15",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-[#FB7185] group-hover:bg-rose-500/20 transition-colors">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <span className="block font-bold">Logout</span>
                <span className="block text-[10px] text-rose-500/80 dark:text-[#FB7185]/80">
                  Securely sign out of your account
                </span>
              </div>
            </div>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-rose-500/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* Change Password Dedicated Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Account Management Tabbed Modal */}
      <AccountManagementModal
        isOpen={accountModalTab !== null}
        initialTab={accountModalTab ?? "overview"}
        user={user}
        onClose={() => setAccountModalTab(null)}
        onOpenChangePassword={() => setShowPasswordModal(true)}
        onUserUpdated={onUserUpdated}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </div>
  );
}
