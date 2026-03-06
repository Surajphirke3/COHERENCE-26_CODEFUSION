// src/lib/services/ThrottleService.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { ExecutionModel, OrganizationModel } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ThrottleResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class ThrottleService {
  /**
   * Check whether the org is under its daily send limit.
   * Counts Execution documents with `executedAt` in the last 24 hours.
   *
   * @param orgId      - Organisation ID
   * @param campaignId - Campaign ID (reserved for future per-campaign limits)
   * @returns ThrottleResult indicating if sending is allowed
   */
  async checkAndIncrement(
    orgId: string,
    campaignId: string,
  ): Promise<ThrottleResult> {
    await connectDB();
    void campaignId;

    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    const limit = org.safetyConfig.dailyLimit;
    const currentCount = await this.getDailySendCount(orgId);

    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
    };
  }

  /**
   * Count the number of executions completed in the last 24 hours for an org.
   *
   * @param orgId - Organisation ID
   * @returns Count of recent executions
   */
  async getDailySendCount(orgId: string): Promise<number> {
    await connectDB();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // We need to join through Campaign to filter by orgId
    // Since Execution doesn't have orgId directly, we first get campaign IDs for this org
    const { CampaignModel } = await import('@/lib/models');
    const campaignIds = await CampaignModel.find(
      { orgId: new mongoose.Types.ObjectId(orgId) },
      { _id: 1 },
    ).lean();

    const ids = campaignIds.map((c) => c._id);
    if (ids.length === 0) return 0;

    return ExecutionModel.countDocuments({
      campaignId: { $in: ids },
      executedAt: { $gte: twentyFourHoursAgo },
      status: 'completed',
      action: 'email',
    });
  }

  /**
   * Reset daily send counters for an org — used in tests only.
   * In practice this removes recent Execution records for the org.
   *
   * @param orgId - Organisation ID
   */
  async resetDailyCount(orgId: string): Promise<void> {
    await connectDB();

    const { CampaignModel } = await import('@/lib/models');
    const campaignIds = await CampaignModel.find(
      { orgId: new mongoose.Types.ObjectId(orgId) },
      { _id: 1 },
    ).lean();

    const ids = campaignIds.map((c) => c._id);
    if (ids.length === 0) return;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await ExecutionModel.deleteMany({
      campaignId: { $in: ids },
      executedAt: { $gte: twentyFourHoursAgo },
    });
  }
}

export const throttleService = new ThrottleService();
