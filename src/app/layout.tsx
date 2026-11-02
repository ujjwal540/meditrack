import type { Metadata, Viewport } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/components/layout/AccessibilityProvider";
import { ReminderProvider } from "@/components/reminders/ReminderProvider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "MediTrack – Never Miss Your Medicine",
  description: "A caring medicine companion for seniors and their families.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F6EF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AccessibilityProvider>
          <ReminderProvider>{children}</ReminderProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
