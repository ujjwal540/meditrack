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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem("meditrack.a11y")||"{}");var d=document.documentElement;if(p.theme==="light"){d.dataset.theme="light";d.classList.remove("dark");}else{d.dataset.theme="dark";d.classList.add("dark");}if(p.contrast){d.dataset.contrast="high";}else{d.dataset.contrast="normal";}if(p.easy){d.dataset.easy="true";}}catch(e){}})()`,
          }}
        />
      </head>
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
