import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/components/layout/AccessibilityProvider";
import { ReminderProvider } from "@/components/reminders/ReminderProvider";

export const metadata: Metadata = {
  title: "MediTrack – Never Miss Your Medicine",
  description: "A caring medicine companion for seniors and their families.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "MediTrack – Never Miss Your Medicine",
    description: "A caring medicine companion for seniors and their families.",
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
        <AccessibilityProvider>
          <ReminderProvider>{children}</ReminderProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
