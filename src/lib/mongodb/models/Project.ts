import { Schema, model, models } from 'mongoose'

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'paused', 'done'], default: 'active' },
    color: { type: String, default: '#6366f1' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
  },
  { timestamps: true }
)

ProjectSchema.index({ status: 1 })
ProjectSchema.index({ ownerId: 1 })

export const Project = (models.Project || model('Project', ProjectSchema)) as any
