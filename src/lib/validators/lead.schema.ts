// src/lib/validators/lead.schema.ts
import { z } from "zod";
import { LEAD_STAGES } from "@/lib/constants";

export const LeadCreateSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  company: z.string().optional(),
  role: z.string().optional(),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  painPoint: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  stage: z.enum(LEAD_STAGES).optional(),
  score: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export const LeadImportRowSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().toLowerCase(),
  company: z.string().optional(),
  role: z.string().optional(),
  linkedinUrl: z.string().optional(),
  painPoint: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string()).optional(),
});

export const BulkActionSchema = z.object({
  action: z.enum(["tag", "pause", "delete", "stage_change"]),
  leadIds: z.array(z.string()).min(1, "At least one lead ID is required"),
  value: z.string().optional(),
});

export const LeadFilterSchema = z.object({
  stage: z.enum(LEAD_STAGES).optional(),
  search: z.string().optional(),
  campaignId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;
export type LeadImportRowInput = z.infer<typeof LeadImportRowSchema>;
export type BulkActionInput = z.infer<typeof BulkActionSchema>;
export type LeadFilterInput = z.infer<typeof LeadFilterSchema>;
