// src/app/(dashboard)/DashboardShell.tsx
'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topnav } from '@/components/layout/Topnav';
import { useUIStore } from '@/lib/store/uiStore';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={cn('flex-1 transition-all duration-200', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <Topnav />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
