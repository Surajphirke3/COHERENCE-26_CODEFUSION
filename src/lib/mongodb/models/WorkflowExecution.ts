import { Schema, model, models } from 'mongoose'

const StepHistorySchema = new Schema(
  {
    nodeId: { type: String, required: true },
    nodeType: { type: String, required: true },
    executedAt: { type: Date, default: Date.now },
    result: { type: String, enum: ['success', 'failed', 'skipped'], default: 'success' },
    messageGenerated: { type: String },
    delayUsedSeconds: { type: Number },
  },
  { _id: false }
)

const WorkflowExecutionSchema = new Schema(
  {
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentNodeId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'running', 'paused', 'completed', 'failed', 'opted_out'],
      default: 'pending',
    },
    stepHistory: { type: [StepHistorySchema], default: [] },
    nextExecutionAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
)

WorkflowExecutionSchema.index({ workflowId: 1, status: 1 })
WorkflowExecutionSchema.index({ leadId: 1 })
WorkflowExecutionSchema.index({ ownerId: 1, status: 1 })

export const WorkflowExecution =
  (models.WorkflowExecution || model('WorkflowExecution', WorkflowExecutionSchema)) as any
