import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/components/layout/AccessibilityProvider";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ReminderProvider } from "@/components/reminders/ReminderProvider";

export const metadata: Metadata = {
  title: "MediTrack - Smart Medicine Reminder & Family Care",
  description: "Never miss a dose. Precision medicine scheduling, adherence tracking, and consent-based family caregiver coordination.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "MediTrack - Smart Medicine Reminder & Family Care",
    description: "Never miss a dose. Precision medicine scheduling, adherence tracking, and consent-based family caregiver coordination.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F6EF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AccessibilityProvider>
            <ReminderProvider>{children}</ReminderProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
