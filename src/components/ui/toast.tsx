// src/components/ui/toast.tsx
'use client';

import React from 'react';
import { useToast } from '@/contexts/toast-context';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full fade-in flex w-80 items-start gap-3 rounded-lg border bg-card p-4 shadow-lg transition-all"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-success" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-danger" />}
            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-warning" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-accent" />}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
