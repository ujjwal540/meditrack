"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("MediTrack page error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">MediTrack could not load this page</h1>
        <p className="mt-3 text-slate-600">Your reminder data is safe. Reload the page or try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-12 rounded-xl bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
