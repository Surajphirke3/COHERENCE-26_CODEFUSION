// src/lib/models/Workflow.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IWorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface IWorkflow extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  graph: {
    nodes: IWorkflowNode[];
    edges: IWorkflowEdge[];
  };
  version: number;
  isTemplate: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema<IWorkflowNode>(
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

const WorkflowEdgeSchema = new Schema<IWorkflowEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    condition: { type: String },
  },
  { _id: false }
);

const WorkflowSchema = new Schema<IWorkflow>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    graph: {
      nodes: { type: [WorkflowNodeSchema], default: [] },
      edges: { type: [WorkflowEdgeSchema], default: [] },
    },
    version: { type: Number, default: 1 },
    isTemplate: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

WorkflowSchema.index({ orgId: 1 });
WorkflowSchema.index({ orgId: 1, isTemplate: 1 });

const WorkflowModel: Model<IWorkflow> =
  mongoose.models.Workflow ||
  mongoose.model<IWorkflow>("Workflow", WorkflowSchema);

export default WorkflowModel;
