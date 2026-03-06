// src/lib/services/CampaignOrchestrator.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  CampaignModel,
  LeadModel,
  ExecutionModel,
  type ICampaign,
  type ILead,
} from '@/lib/models';
import { throttleService } from './ThrottleService';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CampaignBatchResult {
  campaignId: string;
  queued: number;
  skipped: number;
}

export interface OrchestratorResult {
  processed: number;
  campaigns: CampaignBatchResult[];
  errors: { campaignId: string; error: string }[];
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class CampaignOrchestrator {
  /**
   * Top-level cron entry point: process all active campaigns.
   *
   * @returns Aggregated orchestrator result
   */
  async processAllActiveCampaigns(): Promise<OrchestratorResult> {
    await connectDB();

    const activeCampaigns = await CampaignModel.find({
      status: 'active',
    }).lean<ICampaign[]>();

    const results: CampaignBatchResult[] = [];
    const errors: { campaignId: string; error: string }[] = [];

    for (const campaign of activeCampaigns) {
      try {
        const result = await this.processCampaign(campaign);
        results.push(result);
      } catch (err) {
        errors.push({
          campaignId: campaign._id.toString(),
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return {
      processed: activeCampaigns.length,
      campaigns: results,
      errors,
    };
  }

  /**
   * Process a single campaign: find eligible leads and create pending executions.
   *
   * @param campaign - Campaign document
   * @returns Batch result for this campaign
   */
  async processCampaign(campaign: ICampaign): Promise<CampaignBatchResult> {
    await connectDB();

    const campaignId = campaign._id.toString();
    const orgId = campaign.orgId.toString();

    // Check daily throttle to determine remaining capacity
    const throttle = await throttleService.checkAndIncrement(orgId, campaignId);
    const remaining = Math.max(0, throttle.limit - throttle.currentCount);

    if (remaining === 0) {
      return { campaignId, queued: 0, skipped: 0 };
    }

    // Get leads needing processing
    const leads = await this.getLeadsToProcess(campaignId, remaining);

    let queued = 0;
    let skipped = 0;

    for (const lead of leads) {
      // Double-check no pending/processing execution exists for this lead
      const existing = await ExecutionModel.findOne({
        campaignId: new mongoose.Types.ObjectId(campaignId),
        leadId: lead._id,
        status: { $in: ['pending', 'processing'] },
      }).lean();

      if (existing) {
        skipped++;
        continue;
      }

      // Create a pending execution — the execution engine will pick it up
      await ExecutionModel.create({
        campaignId: new mongoose.Types.ObjectId(campaignId),
        leadId: lead._id,
        nodeId: 'pending',   // Will be resolved by ExecutionEngine
        action: 'email',     // Default; will be overridden at execution time
        status: 'pending',
        scheduledAt: new Date(),
      });

      queued++;
    }

    return { campaignId, queued, skipped };
  }

  /**
   * Fetch leads eligible for the next processing step.
   *
   * @param campaignId - Campaign ID
   * @param limit      - Maximum leads to return
   * @returns Array of eligible leads
   */
  async getLeadsToProcess(
    campaignId: string,
    limit: number,
  ): Promise<ILead[]> {
    await connectDB();

    // Get lead IDs that already have pending/processing executions
    const busyExecutions = await ExecutionModel.find(
      {
        campaignId: new mongoose.Types.ObjectId(campaignId),
        status: { $in: ['pending', 'processing'] },
      },
      { leadId: 1 },
    ).lean();

    const busyLeadIds = busyExecutions.map((e) => e.leadId);

    return LeadModel.find({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      stage: { $in: ['imported', 'pending', 'contacted'] },
      _id: { $nin: busyLeadIds },
    })
      .limit(limit)
      .lean<ILead[]>();
  }
}

export const campaignOrchestrator = new CampaignOrchestrator();
