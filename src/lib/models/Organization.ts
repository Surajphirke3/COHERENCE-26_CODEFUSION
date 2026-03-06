// src/lib/models/Organization.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOrgMember {
  userId: mongoose.Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface ISafetyConfig {
  dailyLimit: number;
  minDelayMs: number;
  maxDelayMs: number;
  timeWindowStart: number;
  timeWindowEnd: number;
  pauseOnBounceRate: number;
}

export interface ISmtpConfig {
  host: string;
  port: number;
  user: string;
  passEncrypted: string;
  from: string;
}

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  plan: "free" | "growth" | "scale" | "enterprise";
  members: IOrgMember[];
  safetyConfig: ISafetyConfig;
  smtpConfig?: ISmtpConfig;
  createdAt: Date;
  updatedAt: Date;
}

const OrgMemberSchema = new Schema<IOrgMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SafetyConfigSchema = new Schema<ISafetyConfig>(
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

const SmtpConfigSchema = new Schema<ISmtpConfig>(
  {
    host: { type: String },
    port: { type: Number },
    user: { type: String },
    passEncrypted: { type: String },
    from: { type: String },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    plan: {
      type: String,
      enum: ["free", "growth", "scale", "enterprise"],
      default: "free",
    },
    members: { type: [OrgMemberSchema], default: [] },
    safetyConfig: {
      type: SafetyConfigSchema,
      default: () => ({}),
    },
    smtpConfig: {
      type: SmtpConfigSchema,
      default: undefined,
    },
  },
  { timestamps: true }
);

const OrganizationModel: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default OrganizationModel;
