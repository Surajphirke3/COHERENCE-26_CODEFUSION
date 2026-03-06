// src/lib/services/SafetyPolicyEnforcer.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  OrganizationModel,
  LeadModel,
  OutreachMessageModel,
  SafetyEventModel,
  CampaignModel,
  type ISafetyEvent,
} from '@/lib/models';
import { delayCalculator } from './DelayCalculator';
import { throttleService } from './ThrottleService';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SafetyAction = 'send' | 'delay' | 'pause_campaign' | 'skip_lead';

export interface SafetyResult {
  allowed: boolean;
  reason?: string;
  action: SafetyAction;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class SafetyPolicyEnforcer {
  /**
   * Run all pre-send safety checks in sequence.
   *
   * @param campaignId - Campaign ID
   * @param leadId     - Lead ID
   * @param orgId      - Organisation ID
   * @returns SafetyResult with the recommended action
   */
  async check(
    campaignId: string,
    leadId: string,
    orgId: string,
  ): Promise<SafetyResult> {
    await connectDB();

    // 1. Time window check
    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    const { timeWindowStart, timeWindowEnd, pauseOnBounceRate } = org.safetyConfig;
    if (!delayCalculator.isWithinTimeWindow(timeWindowStart, timeWindowEnd)) {
      return {
        allowed: false,
        action: 'delay',
        reason: 'Outside send window',
      };
    }

    // 2. Throttle check
    const throttleResult = await throttleService.checkAndIncrement(orgId, campaignId);
    if (!throttleResult.allowed) {
      return {
        allowed: false,
        action: 'delay',
        reason: `Daily limit reached (${throttleResult.currentCount}/${throttleResult.limit})`,
      };
    }

    // 3. Bounce rate check
    const bounceRate = await this.checkBounceRate(campaignId);
    if (bounceRate > pauseOnBounceRate) {
      await this.createSafetyEvent(
        orgId,
        campaignId,
        'bounce_threshold',
        'critical',
        `Bounce rate ${(bounceRate * 100).toFixed(1)}% exceeds threshold ${(pauseOnBounceRate * 100).toFixed(1)}%`,
        { bounceRate, threshold: pauseOnBounceRate },
      );
      // Pause the campaign
      await CampaignModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(campaignId),
        { status: 'paused', pausedAt: new Date() },
      );
      return {
        allowed: false,
        action: 'pause_campaign',
        reason: `Bounce rate ${(bounceRate * 100).toFixed(1)}% exceeds safety threshold`,
      };
    }

    // 4. Lead stage check
    const lead = await LeadModel.findById(
      new mongoose.Types.ObjectId(leadId),
    ).lean();
    if (!lead) {
      return { allowed: false, action: 'skip_lead', reason: 'Lead not found' };
    }
    if (lead.stage === 'unsubscribed' || lead.stage === 'bounced') {
      return {
        allowed: false,
        action: 'skip_lead',
        reason: `Lead is ${lead.stage}`,
      };
    }

    // 5. All checks passed
    return { allowed: true, action: 'send' };
  }

  /**
   * Calculate the bounce rate for a campaign (bounced / total sent).
   *
   * @param campaignId - Campaign ID
   * @returns Bounce rate as a decimal (e.g. 0.05 = 5 %)
   */
  async checkBounceRate(campaignId: string): Promise<number> {
    await connectDB();
    const cId = new mongoose.Types.ObjectId(campaignId);

    const [total, bounced] = await Promise.all([
      OutreachMessageModel.countDocuments({
        campaignId: cId,
        status: { $in: ['sent', 'opened', 'clicked', 'replied', 'bounced'] },
      }),
      OutreachMessageModel.countDocuments({
        campaignId: cId,
        status: 'bounced',
      }),
    ]);

    if (total === 0) return 0;
    return bounced / total;
  }

  /**
   * Persist a safety event to the database.
   *
   * @param orgId      - Organisation ID
   * @param campaignId - Campaign ID
   * @param type       - Event type
   * @param severity   - Event severity
   * @param message    - Human-readable description
   * @param details    - Additional structured details
   */
  async createSafetyEvent(
    orgId: string,
    campaignId: string,
    type: ISafetyEvent['type'],
    severity: ISafetyEvent['severity'],
    message: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await connectDB();
    await SafetyEventModel.create({
      orgId: new mongoose.Types.ObjectId(orgId),
      campaignId: new mongoose.Types.ObjectId(campaignId),
      type,
      severity,
      message,
      details,
      triggeredAt: new Date(),
      isResolved: false,
    });
  }
}

export const safetyPolicyEnforcer = new SafetyPolicyEnforcer();
