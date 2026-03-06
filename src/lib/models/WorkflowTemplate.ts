// src/lib/models/WorkflowTemplate.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { IWorkflowNode, IWorkflowEdge } from "./Workflow";

export interface IWorkflowTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category:
    | "cold_outreach"
    | "follow_up"
    | "re_engagement"
    | "event_follow_up"
    | "investor_outreach";
  graph: {
    nodes: IWorkflowNode[];
    edges: IWorkflowEdge[];
  };
  isPublic: boolean;
  createdBy?: mongoose.Types.ObjectId;
  usageCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const TemplateEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    condition: { type: String },
  },
  { _id: false }
);

const WorkflowTemplateSchema = new Schema<IWorkflowTemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        "cold_outreach",
        "follow_up",
        "re_engagement",
        "event_follow_up",
        "investor_outreach",
      ],
      required: true,
    },
    graph: {
      nodes: { type: [TemplateNodeSchema], default: [] },
      edges: { type: [TemplateEdgeSchema], default: [] },
    },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    usageCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

WorkflowTemplateSchema.index({ category: 1 });
WorkflowTemplateSchema.index({ isPublic: 1 });
WorkflowTemplateSchema.index({ usageCount: -1 });

const WorkflowTemplateModel: Model<IWorkflowTemplate> =
  mongoose.models.WorkflowTemplate ||
  mongoose.model<IWorkflowTemplate>(
    "WorkflowTemplate",
    WorkflowTemplateSchema
  );

export default WorkflowTemplateModel;
