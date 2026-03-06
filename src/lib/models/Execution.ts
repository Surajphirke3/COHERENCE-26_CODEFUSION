// src/lib/models/Execution.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IGeneratedMessage {
  subject: string;
  body: string;
  tone: string;
}

export interface IExecution extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  nodeId: string;
  action: "email" | "wait" | "condition_check" | "linkedin" | "ai_generate";
  status: "pending" | "processing" | "completed" | "failed" | "skipped";
  generatedMessage?: IGeneratedMessage;
  delayMs?: number;
  scheduledAt?: Date;
  executedAt?: Date;
  error?: string;
  retryCount: number;
  createdAt: Date;
}

const GeneratedMessageSchema = new Schema<IGeneratedMessage>(
  {
    subject: { type: String },
    body: { type: String },
    tone: { type: String },
  },
  { _id: false }
);

const ExecutionSchema = new Schema<IExecution>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    nodeId: { type: String, required: true },
    action: {
      type: String,
      enum: ["email", "wait", "condition_check", "linkedin", "ai_generate"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "skipped"],
      default: "pending",
    },
    generatedMessage: { type: GeneratedMessageSchema },
    delayMs: { type: Number },
    scheduledAt: { type: Date },
    executedAt: { type: Date },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ExecutionSchema.index({ campaignId: 1, status: 1 });
ExecutionSchema.index({ campaignId: 1, leadId: 1 });
ExecutionSchema.index({ scheduledAt: 1, status: 1 });

const ExecutionModel: Model<IExecution> =
  mongoose.models.Execution ||
  mongoose.model<IExecution>("Execution", ExecutionSchema);

export default ExecutionModel;
