// src/lib/services/ActivityLogger.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { ActivityModel, type IActivity } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Action Constants                                                   */
/* ------------------------------------------------------------------ */

export const ACTIONS = {
  CAMPAIGN_LAUNCHED: 'campaign.launched',
  CAMPAIGN_PAUSED: 'campaign.paused',
  LEAD_STAGE_CHANGED: 'lead.stage_changed',
  EXECUTION_COMPLETED: 'execution.completed',
  EXECUTION_FAILED: 'execution.failed',
  SAFETY_EVENT_TRIGGERED: 'safety.event_triggered',
  LEAD_REPLIED: 'lead.replied',
  MESSAGE_OPENED: 'message.opened',
  MESSAGE_CLICKED: 'message.clicked',
} as const;

export type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LogParams {
  orgId: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: string | mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class ActivityLogger {
  /**
   * Append a new activity entry to the audit trail.
   *
   * @param params - Activity details (orgId, userId, action, etc.)
   */
  async log(params: LogParams): Promise<void> {
    await connectDB();
    await ActivityModel.create({
      orgId: new mongoose.Types.ObjectId(String(params.orgId)),
      userId: new mongoose.Types.ObjectId(String(params.userId)),
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId
        ? new mongoose.Types.ObjectId(String(params.resourceId))
        : undefined,
      metadata: params.metadata,
    });
  }

  /**
   * Fetch the most recent activity entries for an organisation.
   *
   * @param orgId - Organisation ID
   * @param limit - Maximum number of entries to return (default 20)
   * @returns Array of activity documents
   */
  async getRecentActivity(
    orgId: string,
    limit = 20,
  ): Promise<IActivity[]> {
    await connectDB();
    return ActivityModel.find({ orgId: new mongoose.Types.ObjectId(orgId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IActivity[]>();
  }

  /**
   * Fetch all activity entries related to a specific lead.
   *
   * @param leadId - Lead ID
   * @returns Array of activity documents
   */
  async getLeadActivity(leadId: string): Promise<IActivity[]> {
    await connectDB();
    return ActivityModel.find({
      resourceType: 'lead',
      resourceId: new mongoose.Types.ObjectId(leadId),
    })
      .sort({ createdAt: -1 })
      .lean<IActivity[]>();
  }
}

export const activityLogger = new ActivityLogger();
