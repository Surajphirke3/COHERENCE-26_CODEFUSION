// src/lib/validators/campaign.schema.ts
import { z } from "zod";

export const SafetyConfigSchema = z.object({
  dailyLimit: z.number().min(1).max(500),
  minDelayMs: z.number().min(60000),
  maxDelayMs: z.number().min(60000),
  timeWindowStart: z.number().min(0).max(23),
  timeWindowEnd: z.number().min(0).max(23),
  pauseOnBounceRate: z.number().min(0).max(1),
});

export const CampaignCreateSchema = z.object({
  name: z.string().min(1, "Campaign name is required").trim(),
  workflowId: z.string().min(1, "Workflow ID is required"),
  leadIds: z.array(z.string()).default([]),
  safetyConfig: SafetyConfigSchema.partial().optional(),
});

export const LaunchSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
});

export type SafetyConfigInput = z.infer<typeof SafetyConfigSchema>;
export type CampaignCreateInput = z.infer<typeof CampaignCreateSchema>;
export type LaunchInput = z.infer<typeof LaunchSchema>;
