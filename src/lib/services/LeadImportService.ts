// src/lib/services/LeadImportService.ts
import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { LeadModel, type ILead } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Error                                                              */
/* ------------------------------------------------------------------ */

export class ImportError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ImportError';
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type RawRow = Record<string, unknown>;

export interface ColumnMapping {
  email: string;
  name: string;
  company?: string;
  role?: string;
  linkedinUrl?: string;
  painPoint?: string;
  industry?: string;
  website?: string;
}

export interface RowValidation {
  valid: boolean;
  errors: string[];
  lead?: Partial<ILead>;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: { row: number; message: string }[];
  leads: ILead[];
}

/* ------------------------------------------------------------------ */
/*  Fuzzy column mapping                                               */
/* ------------------------------------------------------------------ */

const COLUMN_ALIASES: Record<keyof ColumnMapping, string[]> = {
  email: ['email', 'email address', 'e-mail', 'mail', 'emailaddress'],
  name: ['name', 'full name', 'fullname', 'first name', 'contact name', 'firstname', 'contact'],
  company: ['company', 'company name', 'companyname', 'organisation', 'organization', 'org'],
  role: ['role', 'title', 'job title', 'jobtitle', 'position', 'designation'],
  linkedinUrl: ['linkedin', 'linkedin url', 'linkedinurl', 'linkedin profile'],
  painPoint: ['pain point', 'painpoint', 'challenge', 'pain', 'problem'],
  industry: ['industry', 'sector', 'vertical'],
  website: ['website', 'url', 'web', 'site', 'domain'],
};

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class LeadImportService {
  /**
   * Parse an Excel or CSV buffer into an array of raw row objects.
   *
   * @param buffer   - File buffer
   * @param filename - Original filename (used to detect format)
   * @returns Array of raw row objects
   */
  parseFile(buffer: Buffer, filename: string): RawRow[] {
    try {
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
        raw: false,
      });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new ImportError('No sheets found in file');

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });

      if (rows.length === 0) {
        throw new ImportError('File contains no data rows');
      }

      return rows;
    } catch (err) {
      if (err instanceof ImportError) throw err;
      throw new ImportError(`Failed to parse file "${filename}"`, err);
    }
  }

  /**
   * Fuzzy-match spreadsheet column headers to our lead field names.
   *
   * @param headers - Array of column header strings
   * @returns Mapping from our field names to actual header strings
   */
  detectColumnMapping(headers: string[]): ColumnMapping {
    const normalised = headers.map((h) => h.toLowerCase().trim());
    const mapping: Partial<ColumnMapping> = {};

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      const idx = normalised.findIndex((h) => aliases.includes(h));
      if (idx !== -1) {
        (mapping as Record<string, string>)[field] = headers[idx];
      }
    }

    if (!mapping.email) throw new ImportError('Could not find an email column');
    if (!mapping.name) {
      // Fallback: use email prefix as name
      mapping.name = mapping.email;
    }

    return mapping as ColumnMapping;
  }

  /**
   * Map a raw spreadsheet row to a partial Lead object using the column mapping.
   *
   * @param row     - Raw row data
   * @param mapping - Column mapping
   * @returns Partial ILead
   */
  mapRow(row: RawRow, mapping: ColumnMapping): Partial<ILead> {
    const get = (key?: string): string | undefined =>
      key ? (String(row[key] ?? '').trim() || undefined) : undefined;

    let name = get(mapping.name);
    const email = get(mapping.email)?.toLowerCase();

    // If name column IS the email column, derive name from email
    if (mapping.name === mapping.email && email) {
      name = email.split('@')[0].replace(/[._-]/g, ' ');
    }

    return {
      name: name ?? '',
      email: email ?? '',
      company: get(mapping.company),
      role: get(mapping.role),
      linkedinUrl: get(mapping.linkedinUrl),
      painPoint: get(mapping.painPoint),
      industry: get(mapping.industry),
      website: get(mapping.website),
    } as Partial<ILead>;
  }

  /**
   * Validate a mapped lead row.
   *
   * @param row   - Partial lead data
   * @param index - Row number (1-indexed) for error reporting
   * @returns Validation result
   */
  validateRow(row: Partial<ILead>, index: number): RowValidation {
    const errors: string[] = [];

    if (!row.email) {
      errors.push(`Row ${index}: Missing email`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push(`Row ${index}: Invalid email "${row.email}"`);
    }

    if (!row.name) {
      errors.push(`Row ${index}: Missing name`);
    }

    return {
      valid: errors.length === 0,
      errors,
      lead: errors.length === 0 ? row : undefined,
    };
  }

  /**
   * Deduplicate leads against existing records in the database for the given org.
   *
   * @param leads - Array of leads to check
   * @param orgId - Organisation ID
   * @returns Object with `toInsert` (new leads) and `duplicates` (existing emails)
   */
  async deduplicateWithDB(
    leads: Partial<ILead>[],
    orgId: string,
  ): Promise<{ toInsert: Partial<ILead>[]; duplicates: string[] }> {
    await connectDB();

    const emails = leads.map((l) => l.email!).filter(Boolean);
    const existing = await LeadModel.find(
      {
        orgId: new mongoose.Types.ObjectId(orgId),
        email: { $in: emails },
      },
      { email: 1 },
    ).lean();

    const existingSet = new Set(existing.map((e) => e.email));
    const duplicates: string[] = [];
    const toInsert: Partial<ILead>[] = [];

    for (const lead of leads) {
      if (lead.email && existingSet.has(lead.email)) {
        duplicates.push(lead.email);
      } else {
        toInsert.push(lead);
      }
    }

    return { toInsert, duplicates };
  }

  /**
   * Full import pipeline: parse → map → validate → dedup → insert.
   *
   * @param buffer     - File buffer
   * @param filename   - Original filename
   * @param orgId      - Organisation ID
   * @param campaignId - Optional campaign to link leads to
   * @returns Import result summary
   */
  async batchImport(
    buffer: Buffer,
    filename: string,
    orgId: string,
    campaignId?: string,
  ): Promise<ImportResult> {
    // 1. Parse
    const rows = this.parseFile(buffer, filename);

    // 2. Detect column mapping
    const headers = Object.keys(rows[0]);
    const mapping = this.detectColumnMapping(headers);

    // 3. Map and validate each row
    const validLeads: Partial<ILead>[] = [];
    const importErrors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const mapped = this.mapRow(rows[i], mapping);
      const validation = this.validateRow(mapped, i + 1);

      if (validation.valid && validation.lead) {
        validLeads.push(validation.lead);
      } else {
        for (const e of validation.errors) {
          importErrors.push({ row: i + 1, message: e });
        }
      }
    }

    // 4. Deduplicate
    const { toInsert, duplicates } = await this.deduplicateWithDB(validLeads, orgId);

    // 5. Bulk insert
    const docs = toInsert.map((lead) => ({
      ...lead,
      orgId: new mongoose.Types.ObjectId(orgId),
      campaignId: campaignId
        ? new mongoose.Types.ObjectId(campaignId)
        : undefined,
      stage: 'imported' as const,
      score: 0,
      tags: [],
      importedAt: new Date(),
    }));

    let insertedLeads: ILead[] = [];
    if (docs.length > 0) {
      insertedLeads = (await LeadModel.insertMany(docs)) as unknown as ILead[];
    }

    return {
      inserted: insertedLeads.length,
      skipped: duplicates.length,
      errors: importErrors,
      leads: insertedLeads,
    };
  }
}

export const leadImportService = new LeadImportService();
