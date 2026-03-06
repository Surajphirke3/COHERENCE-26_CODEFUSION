// src/lib/models/OutreachMessage.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOutreachMessage extends Document {
  _id: mongoose.Types.ObjectId;
  executionId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  status:
    | "queued"
    | "sent"
    | "opened"
    | "clicked"
    | "replied"
    | "bounced"
    | "failed";
  trackingPixelId: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  bouncedAt?: Date;
  openCount: number;
  clickCount: number;
  createdAt: Date;
}

const OutreachMessageSchema = new Schema<IOutreachMessage>(
  {
    executionId: {
      type: Schema.Types.ObjectId,
      ref: "Execution",
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    subject: { type: String },
    body: { type: String },
    status: {
      type: String,
      enum: ["queued", "sent", "opened", "clicked", "replied", "bounced", "failed"],
      default: "queued",
    },
    trackingPixelId: { type: String, unique: true },
    sentAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    repliedAt: { type: Date },
    bouncedAt: { type: Date },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

OutreachMessageSchema.index({ leadId: 1 });
OutreachMessageSchema.index({ campaignId: 1, status: 1 });

const OutreachMessageModel: Model<IOutreachMessage> =
  mongoose.models.OutreachMessage ||
  mongoose.model<IOutreachMessage>("OutreachMessage", OutreachMessageSchema);

export default OutreachMessageModel;
