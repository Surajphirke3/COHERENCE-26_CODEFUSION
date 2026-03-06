// src/lib/models/SafetyEvent.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISafetyEvent extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  type:
    | "throttle_limit"
    | "bounce_threshold"
    | "time_window"
    | "anomaly"
    | "manual_pause";
  severity: "info" | "warning" | "critical";
  message: string;
  details?: Record<string, unknown>;
  triggeredAt: Date;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  isResolved: boolean;
}

const SafetyEventSchema = new Schema<ISafetyEvent>({
  orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
  type: {
    type: String,
    enum: [
      "throttle_limit",
      "bounce_threshold",
      "time_window",
      "anomaly",
      "manual_pause",
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
    required: true,
  },
  message: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  triggeredAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isResolved: { type: Boolean, default: false },
});

SafetyEventSchema.index({ orgId: 1, isResolved: 1 });
SafetyEventSchema.index({ campaignId: 1 });
SafetyEventSchema.index({ triggeredAt: -1 });

const SafetyEventModel: Model<ISafetyEvent> =
  mongoose.models.SafetyEvent ||
  mongoose.model<ISafetyEvent>("SafetyEvent", SafetyEventSchema);

export default SafetyEventModel;
