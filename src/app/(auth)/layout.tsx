// src/app/(auth)/layout.tsx
import type { ReactNode } from "react";

/**
 * Auth layout — centered card on a gradient background with
 * the OutreachAI brand mark at the top.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-accent-900 px-4 py-12">
      <div className="w-full max-w-[440px]">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/20 backdrop-blur">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-accent-400"
            >
              <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              <path d="m13 13 6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">OutreachAI</h1>
          <p className="mt-1 text-sm text-brand-400">
            AI-powered outreach automation
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-brand-900/80 p-8 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
