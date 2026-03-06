// src/lib/models/AnalyticsSnapshot.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAnalyticsSnapshot extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  date: Date;
  sends: number;
  opens: number;
  clicks: number;
  replies: number;
  bounces: number;
  conversions: number;
  createdAt: Date;
}

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  orgId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  date: { type: Date, required: true },
  sends: { type: Number, default: 0 },
  opens: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  bounces: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

AnalyticsSnapshotSchema.index({ campaignId: 1, date: 1 }, { unique: true });
AnalyticsSnapshotSchema.index({ orgId: 1, date: 1 });

const AnalyticsSnapshotModel: Model<IAnalyticsSnapshot> =
  mongoose.models.AnalyticsSnapshot ||
  mongoose.model<IAnalyticsSnapshot>(
    "AnalyticsSnapshot",
    AnalyticsSnapshotSchema
  );

export default AnalyticsSnapshotModel;
