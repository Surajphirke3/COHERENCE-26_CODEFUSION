// src/lib/validators/safety.schema.ts
import { z } from "zod";

export const SafetyConfigUpdateSchema = z
  .object({
    dailyLimit: z.number().min(1).max(500),
    minDelayMs: z.number().min(60000),
    maxDelayMs: z.number().min(60000),
    timeWindowStart: z.number().min(0).max(23),
    timeWindowEnd: z.number().min(0).max(23),
    pauseOnBounceRate: z.number().min(0).max(1),
  })
  .partial();

export const AlertResolveSchema = z.object({
  resolvedAt: z.string().datetime().optional(),
});

export const DomainCheckSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

export const SafetySchemas = {
  SafetyConfigUpdateSchema,
  AlertResolveSchema,
  DomainCheckSchema,
};

export type SafetyConfigUpdateInput = z.infer<typeof SafetyConfigUpdateSchema>;
export type AlertResolveInput = z.infer<typeof AlertResolveSchema>;
export type DomainCheckInput = z.infer<typeof DomainCheckSchema>;
