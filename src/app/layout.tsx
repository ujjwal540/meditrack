import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReminderProvider } from "@/components/reminders/ReminderProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MediTrack – Never Miss Your Medicine",
  description: "Smart medicine reminders and family care.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ReminderProvider>{children}</ReminderProvider>
      </body>
    </html>
  );
}
