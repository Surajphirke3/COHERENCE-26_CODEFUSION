// src/lib/constants.ts

/** All possible stages a lead can pass through */
export const LEAD_STAGES = [
  "imported",
  "pending",
  "contacted",
  "opened",
  "clicked",
  "replied",
  "interested",
  "converted",
  "unsubscribed",
  "bounced",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

/** Workflow node types */
export const NODE_TYPES = {
  EMAIL: "email",
  WAIT: "wait",
  CONDITION: "condition",
  LINKEDIN: "linkedin",
  AI_GENERATE: "ai_generate",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

/** Plan-based feature limits (-1 = unlimited) */
export const PLAN_LIMITS = {
  free: { leadsPerMonth: 500, workflows: 3 },
  growth: { leadsPerMonth: 5_000, workflows: -1 },
  scale: { leadsPerMonth: 25_000, workflows: -1 },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

/** Default safety / throttle settings for email sending */
export const SAFETY_DEFAULTS = {
  dailyLimit: 80,
  minDelayMs: 120_000,
  maxDelayMs: 480_000,
  timeWindowStart: 9,
  timeWindowEnd: 18,
} as const;

/** Generic status values shared across workflows, campaigns, etc. */
export const STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];
