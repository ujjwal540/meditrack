import React, { Suspense } from "react";
import { AppRouterProvider, usePathname } from "./lib/next-shim";
import { AccessibilityProvider } from "./components/layout/AccessibilityProvider";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ReminderProvider } from "./components/reminders/ReminderProvider";

// Import Next.js route pages
import HomePage from "./app/page";
import DashboardPage from "./app/dashboard/page";
import MedicinesPage from "./app/medicines/page";
import SchedulePage from "./app/schedule/page";
import HealthPage from "./app/health/page";
import FamilyPage from "./app/family/page";
import HistoryPage from "./app/history/page";
import SettingsPage from "./app/settings/page";
import LoginPage from "./app/login/page";
import RegisterPage from "./app/register/page";
import ForgotPasswordPage from "./app/forgot-password/page";
import ResetPasswordPage from "./app/reset-password/page";
import MarketplacePage from "./app/marketplace/page";
import NotFoundPage from "./app/not-found";

function RouteRenderer() {
  const pathname = usePathname();

  // Normalize path
  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  switch (normalizedPath) {
    case "":
    case "/":
      return <HomePage />;
    case "/dashboard":
      return <DashboardPage />;
    case "/medicines":
      return <MedicinesPage />;
    case "/schedule":
      return <SchedulePage />;
    case "/health":
      return <HealthPage />;
    case "/family":
      return <FamilyPage />;
    case "/marketplace":
      return <MarketplacePage />;
    case "/history":
      return <HistoryPage />;
    case "/settings":
      return <SettingsPage />;
    case "/login":
      return <LoginPage />;
    case "/register":
      return <RegisterPage />;
    case "/forgot-password":
      return <ForgotPasswordPage />;
    case "/reset-password":
      return <ResetPasswordPage />;
    default:
      return <NotFoundPage />;
  }
}

export default function App() {
  return (
    <AppRouterProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <ReminderProvider>
            <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--text-secondary)]">Loading...</div>}>
              <RouteRenderer />
            </Suspense>
          </ReminderProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </AppRouterProvider>
  );
}
