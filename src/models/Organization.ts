// src/models/Organization.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { PlanName } from "@/lib/constants";

export interface ISafetySettings {
  dailyLimit: number;
  minDelayMs: number;
  maxDelayMs: number;
  timeWindowStart: number;
  timeWindowEnd: number;
  pauseOnBounceRate: number;
}

export interface ISmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  provider: "gmail" | "custom";
}

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  ownerId: mongoose.Types.ObjectId;
  plan: PlanName;
  safetySettings: ISafetySettings;
  smtpSettings?: ISmtpSettings;
  createdAt: Date;
  updatedAt: Date;
}

const SafetySettingsSchema = new Schema<ISafetySettings>(
  {
    dailyLimit: { type: Number, default: 80 },
    minDelayMs: { type: Number, default: 120_000 },
    maxDelayMs: { type: Number, default: 480_000 },
    timeWindowStart: { type: Number, default: 9 },
    timeWindowEnd: { type: Number, default: 18 },
    pauseOnBounceRate: { type: Number, default: 5 },
  },
  { _id: false }
);

const SmtpSettingsSchema = new Schema<ISmtpSettings>(
  {
    host: { type: String, default: "" },
    port: { type: Number, default: 587 },
    user: { type: String, default: "" },
    pass: { type: String, default: "" },
    from: { type: String, default: "" },
    provider: { type: String, enum: ["gmail", "custom"], default: "custom" },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "growth", "scale"],
      default: "free",
    },
    safetySettings: {
      type: SafetySettingsSchema,
      default: () => ({}),
    },
    smtpSettings: {
      type: SmtpSettingsSchema,
      default: undefined,
    },
  },
  { timestamps: true }
);

const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
