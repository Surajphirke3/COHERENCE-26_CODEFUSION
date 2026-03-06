// src/lib/services/ABTestService.ts
import crypto from 'crypto';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { OutreachMessageModel } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ABEvent = 'sent' | 'opened' | 'replied';

export interface ABTestResult {
  variant: string;
  sent: number;
  opened: number;
  openRate: number;
  replied: number;
  replyRate: number;
  isWinner: boolean;
}

export interface SignificanceResult {
  significant: boolean;
  confidence: number;
  winner?: string;
}

/* ------------------------------------------------------------------ */
/*  In-memory counters (fast hackathon approach)                       */
/* ------------------------------------------------------------------ */

interface VariantCounters {
  sent: number;
  opened: number;
  replied: number;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class ABTestService {
  /** campaignId → variantId → counters */
  private counters = new Map<string, Map<string, VariantCounters>>();

  /**
   * Deterministically assign a lead to one of the provided variants.
   * Uses a simple hash so the same lead always gets the same variant.
   *
   * @param leadId   - Lead identifier
   * @param variants - Array of variant identifiers
   * @returns The assigned variant string
   */
  assignVariant(leadId: string, variants: string[]): string {
    if (variants.length === 0) throw new Error('At least one variant is required');
    const hash = crypto.createHash('md5').update(leadId).digest('hex');
    const index = parseInt(hash.slice(0, 8), 16) % variants.length;
    return variants[index];
  }

  /**
   * Record an event (sent, opened, replied) for a given campaign variant.
   *
   * @param campaignId - Campaign ID
   * @param variantId  - Variant identifier
   * @param event      - The event type
   */
  recordEvent(campaignId: string, variantId: string, event: ABEvent): void {
    if (!this.counters.has(campaignId)) {
      this.counters.set(campaignId, new Map());
    }
    const campaignMap = this.counters.get(campaignId)!;

    if (!campaignMap.has(variantId)) {
      campaignMap.set(variantId, { sent: 0, opened: 0, replied: 0 });
    }
    const c = campaignMap.get(variantId)!;
    c[event] += 1;
  }

  /**
   * Aggregate A/B test results for a campaign.
   * Merges in-memory counters with OutreachMessage data for accuracy.
   *
   * @param campaignId - Campaign ID
   * @returns Array of per-variant results with winner flag
   */
  async getResults(campaignId: string): Promise<ABTestResult[]> {
    await connectDB();

    // Aggregate from OutreachMessage collection
    const pipeline = [
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: '$subject',
          sent: {
            $sum: { $cond: [{ $in: ['$status', ['sent', 'opened', 'clicked', 'replied']] }, 1, 0] },
          },
          opened: {
            $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked', 'replied']] }, 1, 0] },
          },
          replied: {
            $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] },
          },
        },
      },
    ];

    const dbResults = await OutreachMessageModel.aggregate(pipeline);

    // Also merge in-memory counters
    const combined = new Map<string, VariantCounters>();
    for (const r of dbResults) {
      combined.set(r._id, { sent: r.sent, opened: r.opened, replied: r.replied });
    }
    const memCounters = this.counters.get(campaignId);
    if (memCounters) {
      for (const [variant, c] of memCounters) {
        if (combined.has(variant)) {
          const existing = combined.get(variant)!;
          existing.sent += c.sent;
          existing.opened += c.opened;
          existing.replied += c.replied;
        } else {
          combined.set(variant, { ...c });
        }
      }
    }

    // Build results array
    let bestOpenRate = -1;
    const results: ABTestResult[] = [];
    for (const [variant, c] of combined) {
      const openRate = c.sent > 0 ? c.opened / c.sent : 0;
      const replyRate = c.sent > 0 ? c.replied / c.sent : 0;
      if (openRate > bestOpenRate) bestOpenRate = openRate;
      results.push({ variant, ...c, openRate, replyRate, isWinner: false });
    }

    // Mark winner
    for (const r of results) {
      if (r.openRate === bestOpenRate && bestOpenRate > 0) {
        r.isWinner = true;
        break; // only one winner
      }
    }

    return results;
  }

  /**
   * Basic two-proportion z-test for statistical significance.
   *
   * @param variantA - Counters for variant A
   * @param variantB - Counters for variant B
   * @returns Significance result with confidence level
   */
  calculateSignificance(
    variantA: { sent: number; opened: number },
    variantB: { sent: number; opened: number },
  ): SignificanceResult {
    const nA = variantA.sent;
    const nB = variantB.sent;
    if (nA < 30 || nB < 30) {
      return { significant: false, confidence: 0 };
    }

    const pA = variantA.opened / nA;
    const pB = variantB.opened / nB;
    const pPool = (variantA.opened + variantB.opened) / (nA + nB);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));

    if (se === 0) return { significant: false, confidence: 0 };

    const z = Math.abs(pA - pB) / se;

    // z > 1.96 ≈ 95% confidence
    const confidence = z >= 2.576 ? 99 : z >= 1.96 ? 95 : z >= 1.645 ? 90 : Math.round(z * 40);
    const significant = z >= 1.96;
    const winner = significant ? (pA > pB ? 'A' : 'B') : undefined;

    return { significant, confidence, winner };
  }
}

export const abTestService = new ABTestService();
