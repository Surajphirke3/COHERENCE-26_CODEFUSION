import { Schema, model, models } from 'mongoose'

const WorkflowNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['trigger', 'generateLeads', 'aiMessage', 'sendEmail', 'delay', 'condition', 'tagLead', 'end'],
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
      // AI provider credentials
      aiProvider: { type: String, default: 'groq' },
      aiApiKey: { type: String, default: '' },
      aiModel: { type: String, default: 'llama-3.3-70b-versatile' },
      aiBaseUrl: { type: String, default: '' },
      // SMTP email credentials
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: '' },
      smtpPass: { type: String, default: '' },
      smtpFromEmail: { type: String, default: '' },
      smtpFromName: { type: String, default: '' },
      smtpSecure: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

WorkflowSchema.index({ ownerId: 1, status: 1 })

export const Workflow = (models.Workflow || model('Workflow', WorkflowSchema)) as any
