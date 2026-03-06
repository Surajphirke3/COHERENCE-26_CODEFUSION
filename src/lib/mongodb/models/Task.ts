import { Schema, model, models } from 'mongoose'

const TaskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    position: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
  },
  { timestamps: true }
)

TaskSchema.index({ projectId: 1, status: 1, position: 1 })

export const Task = models.Task || model('Task', TaskSchema)
