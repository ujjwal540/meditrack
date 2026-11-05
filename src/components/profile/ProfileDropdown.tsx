"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  KeyRound,
  Languages,
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
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageContext";

export interface ProfileDropdownProps {
  user: { id: string; name?: string; email?: string; role: UserRole } | null;
  direction?: "up" | "down";
  compact?: boolean;
  className?: string;
  onUserUpdated?: (user: { id: string; name?: string; email?: string; role: UserRole }) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export function ProfileDropdown({
  user,
  direction = "down",
  compact = false,
  className,
  onUserUpdated,
  onOpenChange,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { t, isNepali } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<AccountTab | null>(null);
  const [horizontalShift, setHorizontalShift] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setMenuOpen = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };

  // Close on click outside (mouse or touch)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close when another floating panel opens, and coordinate dismissals
  useEffect(() => {
    function handleCloseFloating(e: Event) {
      const customEvent = e as CustomEvent<{ origin?: string }>;
      if (customEvent.detail?.origin !== "profile") {
        setMenuOpen(false);
      }
    }
    window.addEventListener("meditrack:close-floating", handleCloseFloating);
    return () => window.removeEventListener("meditrack:close-floating", handleCloseFloating);
  }, []);

  // When opened, broadcast to close conflicting floating panels and ensure viewport containment
  useEffect(() => {
    if (!isOpen) {
      setHorizontalShift(0);
      return;
    }

    // Dismiss any conflicting popovers or drawers
    window.dispatchEvent(
      new CustomEvent("meditrack:close-floating", {
        detail: { origin: "profile" },
      }),
    );

    // Viewport containment check
    const checkViewportBounds = () => {
      if (!menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const margin = 12;

      let shift = 0;
      if (rect.left < margin) {
        shift = margin - rect.left;
      } else if (rect.right > viewportWidth - margin) {
        shift = -(rect.right - (viewportWidth - margin));
      }
      setHorizontalShift(shift);
    };

    // Check immediately and on window resize
    checkViewportBounds();
    const handleResize = () => checkViewportBounds();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const roleBadge =
    user?.role === "professional_caregiver"
      ? isNepali ? "हेरचाह विज्ञ" : "Care Pro"
      : user?.role === "family_caregiver"
        ? isNepali ? "परिवार" : "Family Care"
        : user?.role === "admin"
          ? "Admin"
          : isNepali ? "बिरामी" : "Patient";

  function handleAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  const menuItems = [
    {
      id: "overview",
      label: isNepali ? "प्रोफाइल विवरण" : "Profile Overview",
      description: isNepali ? "व्यक्तिगत जानकारी हेर्नुहोस्" : "View personal information",
      icon: User,
      onClick: () => router.push("/profile?tab=overview"),
    },
    {
      id: "account",
      label: isNepali ? "मेरो खाता" : "My Account",
      description: isNepali ? "नाम र फोन नम्बर मिलाउनुहोस्" : "Manage name & contact details",
      icon: UserCheck,
      onClick: () => router.push("/profile?tab=personal"),
    },
    {
      id: "settings",
      label: t.nav.settings,
      description: isNepali ? "भाषा, आवाज तथा रङ छनोट" : "Manage application preferences",
      icon: Settings,
      onClick: () => router.push("/settings"),
    },
    {
      id: "change-password",
      label: isNepali ? "पासवर्ड परिवर्तन" : "Change Password",
      description: isNepali ? "सुरक्षित रूपमा पासवर्ड फेर्नुहोस्" : "Securely update your password",
      icon: KeyRound,
      onClick: () => setShowPasswordModal(true),
    },
    {
      id: "notifications",
      label: isNepali ? "सूचना तथा घण्टी" : "Notifications",
      description: isNepali ? "घण्टीको आवाज र सूचना व्यवस्थापन" : "Audio & reminder preferences",
      icon: Bell,
      onClick: () => router.push("/profile?tab=preferences"),
    },
    {
      id: "privacy",
      label: isNepali ? "गोपनीयता र सुरक्षा" : "Privacy & Security",
      description: isNepali ? "पारिवारिक अनुमति र डेटा सुरक्षा" : "Data isolation & session security",
      icon: ShieldCheck,
      onClick: () => router.push("/profile?tab=privacy"),
    },
    {
      id: "help",
      label: isNepali ? "सहयोग तथा FAQ" : "Help & Support",
      description: isNepali ? "निर्देशिका र प्रयोग विधि" : "Clinical guidelines & FAQ",
      icon: HelpCircle,
      onClick: () => router.push("/profile?tab=overview"),
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
        onClick={() => setMenuOpen(!isOpen)}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-2xl border transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20D6C2]",
          compact
            ? "p-1.5 border-[var(--border)] bg-[var(--surface-elevated)]/80 hover:border-[#20D6C2] hover:shadow-[0_0_16px_rgba(32,214,194,0.25)]"
            : "w-full p-2.5 border-[var(--border)] bg-[var(--surface-elevated)]/60 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(32,214,194,0.2)]",
          isOpen && "border-[#20D6C2] bg-[#16A36A]/15 shadow-[0_0_18px_rgba(32,214,194,0.3)] ring-1 ring-[#20D6C2]/40",
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
              {user?.name || (isNepali ? "सदस्य" : "Patient Member")}
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
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu-button"
          style={{
            transform: horizontalShift ? `translateX(${horizontalShift}px)` : undefined,
          }}
          className={cn(
            "absolute z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border p-2.5 text-[var(--text)]",
            "bg-white dark:bg-[#0A1A12]",
            "border-emerald-500/30 dark:border-emerald-500/30",
            "shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(32,214,194,0.2)]",
            direction === "up"
              ? "bottom-full left-0 mb-2.5 animate-dropdown-up origin-bottom-left"
              : "top-full right-0 mt-2.5 animate-dropdown-down origin-top-right",
          )}
        >
          {/* Top Section: User Name, Email, Profile Picture (Clickable to /profile) */}
          <button
            type="button"
            onClick={() => handleAction(() => router.push("/profile"))}
            className="w-full text-left group flex items-center gap-3 rounded-xl border border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-[#10251A] p-3 mb-2 hover:border-[#20D6C2]/60 hover:bg-emerald-100/60 dark:hover:bg-[#163324] transition-all"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] to-[#20D6C2] text-white text-sm font-black shadow-md shadow-[#16A36A]/30 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="truncate font-display text-xs font-bold text-[var(--text)] group-hover:text-[#16A36A] dark:group-hover:text-[#20D6C2] transition-colors">
                  {user?.name || (isNepali ? "सदस्य" : "Patient Member")}
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
                  {isNepali ? "खाता केन्द्र खोल्नुहोस् →" : "Open Account Center →"}
                </span>
              </div>
            </div>
          </button>

          {/* Quick Language Switcher Inside Profile Menu */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#10251A]/80 border border-emerald-500/15 dark:border-emerald-500/15 mb-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
              <Languages className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" />
              <span>{t.common.language}</span>
            </div>
            <LanguageSwitcher variant="toggle" showIcon={false} />
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
                    "hover:bg-[#16A36A]/10 hover:text-[var(--text)] focus-visible:outline-none focus-visible:bg-[#16A36A]/15",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 dark:bg-[#10251A] border border-emerald-500/20 text-[#16A36A] dark:text-[#20C982] group-hover:border-[#20D6C2]/50 group-hover:bg-[#20D6C2]/15 transition-colors">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-[var(--text)] group-hover:text-[#16A36A] dark:group-hover:text-[#20D6C2] transition-colors truncate">
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

          {/* Logout Option */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(() => setShowLogoutDialog(true))}
            className={cn(
              "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all duration-150",
              "text-rose-600 dark:text-[#FB7185] hover:bg-rose-500/10 hover:border hover:border-rose-500/20 focus-visible:outline-none focus-visible:bg-rose-500/15",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-[#FB7185] group-hover:bg-rose-500/20 transition-colors">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <span className="block font-bold">{t.nav.signOut}</span>
                <span className="block text-[10px] text-rose-500/80 dark:text-[#FB7185]/80">
                  {isNepali ? "खाताबाट सुरक्षित रूपमा बाहिरिनुहोस्" : "Securely sign out of your account"}
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
