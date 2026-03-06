// src/app/(dashboard)/settings/page.tsx
'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and organization" />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Settings page — configure your organization, team, and integrations.</p>
        </div>
      </div>
    </div>
  );
}
