// src/components/leads/LeadImporter.tsx
'use client';

import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnMapper } from './ColumnMapper';
import { useImport } from '@/lib/hooks/useImport';
import { cn } from '@/lib/utils';

export function LeadImporter() {
  const {
    state, file, rows, mapping, errors, progress,
    startImport, updateMapping, confirmImport, reset,
  } = useImport();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) startImport(f);
    },
    [startImport]
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) startImport(f);
    },
    [startImport]
  );

  // Step 1: Dropzone
  if (state === 'idle') {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-16 text-center transition-colors hover:border-accent/50"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted text-accent">
          <Upload size={24} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Drop your file here</h3>
        <p className="mt-1 text-sm text-muted-foreground">Supports .xlsx and .csv files</p>
        <label className="mt-4 cursor-pointer">
          <Button variant="secondary" type="button">Browse Files</Button>
          <input type="file" accept=".xlsx,.csv" onChange={handleFile} className="hidden" />
        </label>
      </div>
    );
  }

  // Parsing state
  if (state === 'parsing') {
    return (
      <div className="flex flex-col items-center py-16">
        <Skeleton variant="card" className="w-full max-w-md" />
        <p className="mt-4 text-sm text-muted-foreground">Parsing file…</p>
      </div>
    );
  }

  // Step 2: Column mapping
  if (state === 'mapping') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileSpreadsheet size={20} className="text-accent" />
          <div>
            <p className="text-sm font-medium text-foreground">{file?.name}</p>
            <p className="text-xs text-muted-foreground">{rows.length} rows detected</p>
          </div>
        </div>

        <ColumnMapper mapping={mapping} onUpdate={updateMapping} />

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Preview (first 5 rows)</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {mapping.filter(m => m.target).map((m) => (
                  <th key={m.source} className="px-3 py-2 text-left font-medium text-muted-foreground">{m.target}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {mapping.filter(m => m.target).map((m) => (
                    <td key={m.source} className="px-3 py-2 text-muted-foreground">{row[m.source]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <Button onClick={confirmImport}>Import {rows.length} leads</Button>
          <Button variant="secondary" onClick={reset}>Cancel</Button>
        </div>
      </div>
    );
  }

  // Uploading
  if (state === 'validating' || state === 'uploading') {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <p className="text-sm text-foreground font-medium">
          {state === 'validating' ? 'Validating data…' : 'Uploading leads…'}
        </p>
        <div className="w-64">
          <Progress value={state === 'validating' ? 50 : progress} variant="accent" showLabel />
        </div>
      </div>
    );
  }

  // Done
  if (state === 'done') {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-muted text-success">
          <CheckCircle size={28} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Import Complete!</h3>
        <p className="text-sm text-muted-foreground">{rows.length} leads imported successfully</p>
        <Button variant="secondary" onClick={reset}>Import More</Button>
      </div>
    );
  }

  // Error
  return (
    <div className="flex flex-col items-center py-16 gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-muted text-danger">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Import Failed</h3>
      <div className="max-h-40 overflow-y-auto rounded-lg border border-danger/20 bg-danger-muted/30 p-3 text-xs text-danger w-full max-w-md">
        {errors.map((err, i) => (
          <p key={i}>{err}</p>
        ))}
      </div>
      <Button variant="secondary" onClick={reset}>Try Again</Button>
    </div>
  );
}
