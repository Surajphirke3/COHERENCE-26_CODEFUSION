// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/contexts/toast-context";
import type { ReactNode } from "react";

/**
 * Client-side providers wrapper.
 * Combines NextAuth SessionProvider and custom ToastProvider.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
