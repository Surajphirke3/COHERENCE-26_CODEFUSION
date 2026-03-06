// src/lib/services/LeadScoringService.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  LeadModel,
  OutreachMessageModel,
  CampaignModel,
  type IOutreachMessage,
} from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ScoreLabel = 'cold' | 'warm' | 'hot';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WEIGHTS = {
  OPENED: 10,
  CLICKED: 20,
  REPLIED: 40,
  FAST_OPEN_BONUS: 10,     // opened within 1 hour of send
  BOUNCED_PENALTY: -50,
} as const;

const FAST_OPEN_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const MAX_SCORE = 100;

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class LeadScoringService {
  /**
   * Compute an engagement score for a single lead based on their OutreachMessage history.
   *
   * @param leadId - Lead document ID
   * @returns The computed score (0–100)
   */
  async computeScore(leadId: string): Promise<number> {
    await connectDB();

    const messages = await OutreachMessageModel.find({
      leadId: new mongoose.Types.ObjectId(leadId),
    }).lean<IOutreachMessage[]>();

    let score = 0;

    for (const msg of messages) {
      // Positive signals
      if (msg.openedAt) {
        score += WEIGHTS.OPENED;

        // Fast-open bonus
        if (msg.sentAt) {
          const timeToOpen = msg.openedAt.getTime() - msg.sentAt.getTime();
          if (timeToOpen <= FAST_OPEN_THRESHOLD_MS) {
            score += WEIGHTS.FAST_OPEN_BONUS;
          }
        }
      }

      if (msg.clickedAt) score += WEIGHTS.CLICKED;
      if (msg.repliedAt) score += WEIGHTS.REPLIED;

      // Negative signals
      if (msg.status === 'bounced') {
        score += WEIGHTS.BOUNCED_PENALTY;
      }
    }

    // Cap
    const finalScore = Math.max(0, Math.min(MAX_SCORE, score));

    // Persist to lead record
    await LeadModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(leadId),
      { score: finalScore },
    );

    return finalScore;
  }

  /**
   * Recompute scores for all leads in a given campaign, processing in batches.
   *
   * @param campaignId - Campaign ID
   */
  async computeScoreForCampaign(campaignId: string): Promise<void> {
    await connectDB();

    const campaign = await CampaignModel.findById(
      new mongoose.Types.ObjectId(campaignId),
    ).lean();
    if (!campaign) return;

    const leads = await LeadModel.find(
      { campaignId: new mongoose.Types.ObjectId(campaignId) },
      { _id: 1 },
    ).lean();

    // Process in batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = leads.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((lead) => this.computeScore(lead._id.toString())),
      );
    }
  }

  /**
   * Convert a numeric score to a human-readable label.
   *
   * @param score - Numeric score (0–100)
   * @returns 'cold' | 'warm' | 'hot'
   */
  getScoreLabel(score: number): ScoreLabel {
    if (score <= 30) return 'cold';
    if (score <= 60) return 'warm';
    return 'hot';
  }
}

export const leadScoringService = new LeadScoringService();
