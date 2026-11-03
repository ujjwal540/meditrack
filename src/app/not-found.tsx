import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text)] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-250">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#16A36A]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo variant="full" size="lg" glow={true} />
        </div>

        <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] backdrop-blur-xl shadow-[var(--shadow-card)] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#16A36A]/15 border border-[#16A36A]/25 flex items-center justify-center text-[#16A36A] dark:text-[#20C982]">
            <HelpCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
              Page Not Found
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              The medical dashboard view or resource you are looking for does not exist or may have been moved.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] hover:brightness-105 text-white font-semibold shadow-lg shadow-[#16A36A]/25 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          MediTrack &bull; Intelligent Medicine Reminder &amp; Care
        </p>
      </div>
    </div>
  );
}
