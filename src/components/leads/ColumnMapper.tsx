// src/components/leads/ColumnMapper.tsx
'use client';

import React from 'react';
import { type ColumnMapping } from '@/lib/hooks/useImport';

const LEAD_FIELDS = [
  { value: '', label: 'Skip' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'company', label: 'Company' },
  { value: 'role', label: 'Role / Title' },
  { value: 'linkedinUrl', label: 'LinkedIn URL' },
  { value: 'industry', label: 'Industry' },
  { value: 'website', label: 'Website' },
  { value: 'painPoint', label: 'Pain Point' },
];

interface ColumnMapperProps {
  mapping: ColumnMapping[];
  onUpdate: (index: number, target: string) => void;
}

export function ColumnMapper({ mapping, onUpdate }: ColumnMapperProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Map Columns</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Match your file columns to lead fields</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-white/[0.02]">
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Source Column</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sample Data</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Maps To</th>
          </tr>
        </thead>
        <tbody>
          {mapping.map((m, i) => (
            <tr key={m.source} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-medium text-foreground">{m.source}</td>
              <td className="px-4 py-2 text-muted-foreground text-xs font-mono truncate max-w-[200px]">{m.sample}</td>
              <td className="px-4 py-2">
                <select
                  value={m.target}
                  onChange={(e) => onUpdate(i, e.target.value)}
                  className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground outline-none focus:border-accent cursor-pointer"
                >
                  {LEAD_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
