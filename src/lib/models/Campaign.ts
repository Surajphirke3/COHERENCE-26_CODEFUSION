// src/lib/models/Campaign.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { ISafetyConfig } from "./Organization";

export interface ICampaignStats {
  totalLeads: number;
  contacted: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  converted: number;
}

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  workflowId?: mongoose.Types.ObjectId;
  leadIds: mongoose.Types.ObjectId[];
  status: "draft" | "active" | "paused" | "completed" | "failed";
  safetyConfig?: ISafetyConfig;
  stats: ICampaignStats;
  launchedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignStatsSchema = new Schema<ICampaignStats>(
  {
    totalLeads: { type: Number, default: 0 },
    contacted: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
  },
  { _id: false }
);

const SafetyConfigEmbeddedSchema = new Schema(
  {
    dailyLimit: { type: Number, default: 80 },
    minDelayMs: { type: Number, default: 120000 },
    maxDelayMs: { type: Number, default: 480000 },
    timeWindowStart: { type: Number, default: 9 },
    timeWindowEnd: { type: Number, default: 18 },
    pauseOnBounceRate: { type: Number, default: 0.05 },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true },
    workflowId: { type: Schema.Types.ObjectId, ref: "Workflow" },
    leadIds: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed", "failed"],
      default: "draft",
    },
    safetyConfig: { type: SafetyConfigEmbeddedSchema, default: undefined },
    stats: { type: CampaignStatsSchema, default: () => ({}) },
    launchedAt: { type: Date },
    completedAt: { type: Date },
    pausedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CampaignSchema.index({ orgId: 1, status: 1 });
CampaignSchema.index({ orgId: 1, createdAt: -1 });

const CampaignModel: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default CampaignModel;
