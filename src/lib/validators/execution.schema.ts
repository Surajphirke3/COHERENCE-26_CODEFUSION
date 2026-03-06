// src/lib/validators/execution.schema.ts
import { z } from "zod";

export const WebhookReplySchema = z.object({
  messageId: z.string().min(1),
  fromEmail: z.string().email(),
  subject: z.string(),
  body: z.string(),
  receivedAt: z.string().datetime().optional(),
});

export const WebhookOpenSchema = z.object({
  trackingPixelId: z.string().min(1),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  openedAt: z.string().datetime().optional(),
});

export const WebhookBounceSchema = z.object({
  messageId: z.string().min(1),
  email: z.string().email(),
  bounceType: z.enum(["hard", "soft"]),
  reason: z.string().optional(),
});

export const WebhookClickSchema = z.object({
  trackingPixelId: z.string().min(1),
  leadId: z.string().optional(),
  campaignId: z.string().optional(),
  url: z.string().url(),
  clickedAt: z.string().datetime().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type WebhookReplyInput = z.infer<typeof WebhookReplySchema>;
export type WebhookOpenInput = z.infer<typeof WebhookOpenSchema>;
export type WebhookBounceInput = z.infer<typeof WebhookBounceSchema>;
export type WebhookClickInput = z.infer<typeof WebhookClickSchema>;
