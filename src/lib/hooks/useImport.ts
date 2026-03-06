// src/lib/hooks/useImport.ts
'use client';

import { useState, useCallback } from 'react';

export type ImportState = 'idle' | 'parsing' | 'mapping' | 'validating' | 'uploading' | 'done' | 'error';

export interface ColumnMapping {
  source: string;
  target: string;
  sample: string;
}

export function useImport() {
  const [state, setState] = useState<ImportState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const startImport = useCallback(async (f: File) => {
    setFile(f);
    setState('parsing');
    setErrors([]);

    try {
      // Dynamic import xlsx
      const XLSX = (await import('xlsx')).default;
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

      if (jsonData.length === 0) {
        setState('error');
        setErrors(['File is empty or has no data rows']);
        return;
      }

      const cols = Object.keys(jsonData[0]);
      setColumns(cols);
      setRows(jsonData);

      // Auto-detect mapping
      const fieldMap: Record<string, string> = {
        name: 'name', fullname: 'name', 'full name': 'name',
        email: 'email', 'email address': 'email',
        company: 'company', organization: 'company', org: 'company',
        role: 'role', title: 'role', 'job title': 'role', position: 'role',
        linkedin: 'linkedinUrl', 'linkedin url': 'linkedinUrl',
        industry: 'industry', website: 'website',
        'pain point': 'painPoint', painpoint: 'painPoint',
      };

      const autoMapping: ColumnMapping[] = cols.map((col) => ({
        source: col,
        target: fieldMap[col.toLowerCase().trim()] || '',
        sample: String(jsonData[0][col] || ''),
      }));

      setMapping(autoMapping);
      setState('mapping');
    } catch {
      setState('error');
      setErrors(['Failed to parse file. Ensure it is a valid .xlsx or .csv file.']);
    }
  }, []);

  const updateMapping = useCallback((index: number, target: string) => {
    setMapping((prev) => prev.map((m, i) => (i === index ? { ...m, target } : m)));
  }, []);

  const confirmImport = useCallback(async () => {
    setState('validating');

    // Build mapped data
    const mappedRows = rows.map((row) => {
      const mapped: Record<string, string> = {};
      mapping.forEach((m) => {
        if (m.target) mapped[m.target] = row[m.source] || '';
      });
      return mapped;
    });

    // Validate required fields
    const validationErrors: string[] = [];
    mappedRows.forEach((row, i) => {
      if (!row.name) validationErrors.push(`Row ${i + 1}: missing name`);
      if (!row.email) validationErrors.push(`Row ${i + 1}: missing email`);
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors.slice(0, 10));
      setState('error');
      return;
    }

    setState('uploading');
    setProgress(0);

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: mappedRows }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Import failed');
      }

      setProgress(100);
      setState('done');
    } catch (err: unknown) {
      setState('error');
      setErrors([err instanceof Error ? err.message : 'Import failed']);
    }
  }, [rows, mapping]);

  const reset = useCallback(() => {
    setState('idle');
    setFile(null);
    setColumns([]);
    setRows([]);
    setMapping([]);
    setErrors([]);
    setProgress(0);
  }, []);

  return {
    state,
    file,
    columns,
    rows,
    mapping,
    errors,
    progress,
    startImport,
    updateMapping,
    confirmImport,
    reset,
  };
}
