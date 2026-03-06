// src/lib/models/Lead.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";
import { LEAD_STAGES, type LeadStage } from "@/lib/constants";

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  company?: string;
  role?: string;
  linkedinUrl?: string;
  painPoint?: string;
  industry?: string;
  website?: string;
  stage: LeadStage;
  score: number;
  tags: string[];
  metadata: Map<string, string>;
  importedAt: Date;
  lastTouchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    linkedinUrl: { type: String },
    painPoint: { type: String },
    industry: { type: String },
    website: { type: String },
    stage: {
      type: String,
      enum: LEAD_STAGES,
      default: "imported",
    },
    score: { type: Number, min: 0, max: 100, default: 0 },
    tags: { type: [String], default: [] },
    metadata: { type: Map, of: String, default: () => new Map() },
    importedAt: { type: Date, default: Date.now },
    lastTouchedAt: { type: Date },
  },
  { timestamps: true }
);

LeadSchema.index({ orgId: 1, email: 1 }, { unique: true });
LeadSchema.index({ campaignId: 1, stage: 1 });
LeadSchema.index({ orgId: 1, stage: 1 });

const LeadModel: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default LeadModel;
