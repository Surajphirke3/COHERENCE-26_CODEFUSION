import { Schema, model, models } from 'mongoose'

const WorkflowNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['trigger', 'aiMessage', 'sendEmail', 'delay', 'condition', 'tagLead', 'end'],
      required: true,
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
)

const WorkflowEdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String },
    targetHandle: { type: String },
    label: { type: String },
  },
  { _id: false }
)

const WorkflowSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nodes: { type: [WorkflowNodeSchema], default: [] },
    edges: { type: [WorkflowEdgeSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
    config: {
      maxActionsPerHour: { type: Number, default: 50 },
      maxActionsPerDay: { type: Number, default: 200 },
      minDelaySeconds: { type: Number, default: 120 },
      businessHoursOnly: { type: Boolean, default: false },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
)

WorkflowSchema.index({ ownerId: 1, status: 1 })

export const Workflow = (models.Workflow || model('Workflow', WorkflowSchema)) as any
