"use client";

import { useState } from "react";
import Image from "next/image";
import { CAREGIVER_PORTRAITS } from "@/services/professional-care-service";

interface CaregiverAvatarProps {
  fullName: string;
  avatarUrl?: string;
  caregiverId?: string;
  userId?: string;
  size?: "card" | "modal" | "compact";
  className?: string;
  priority?: boolean;
}

export function CaregiverAvatar({
  fullName,
  avatarUrl,
  caregiverId,
  userId,
  size = "card",
  className = "",
  priority = false,
}: CaregiverAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Resolve best available portrait
  const resolvedSrc =
    avatarUrl && !avatarUrl.includes("/images/illustrations/")
      ? avatarUrl
      : (caregiverId && CAREGIVER_PORTRAITS[caregiverId]) ||
        (userId && CAREGIVER_PORTRAITS[userId]) ||
        CAREGIVER_PORTRAITS[fullName] ||
        avatarUrl;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CP";

  // Responsive size definitions:
  // - card: Mobile: 80px (w-20 h-20), Tablet: 96px (sm:w-24 sm:h-24), Desktop: 112px (lg:w-28 lg:h-28)
  // - modal: Mobile: 88px, Tablet/Desktop: 112px-120px
  // - compact: 48px (w-12 h-12)
  const sizeClasses = {
    card: "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl sm:rounded-[22px]",
    modal: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-[22px]",
    compact: "w-12 h-12 rounded-xl",
  }[size];

  const pixelDimensions = {
    card: 112,
    modal: 120,
    compact: 48,
  }[size];

  return (
    <div
      className={`relative shrink-0 aspect-square overflow-hidden border border-[#16A36A]/30 dark:border-[#20D6C2]/40 bg-gradient-to-tr from-[#16A36A]/15 to-[#20D6C2]/15 shadow-sm transition-transform duration-200 ${sizeClasses} ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      {resolvedSrc && !imgError ? (
        <Image
          src={resolvedSrc}
          alt={`Professional portrait of ${fullName}`}
          width={pixelDimensions}
          height={pixelDimensions}
          priority={priority}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center block transition-opacity duration-300"
          sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
        />
      ) : (
        /* Graceful Fallback */
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#16A36A] to-[#20D6C2] text-white font-display font-bold text-lg sm:text-xl select-none">
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
}
