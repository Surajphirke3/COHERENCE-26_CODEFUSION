import mongoose, { Schema, model, models } from 'mongoose'

const ActivityLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityTitle: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

ActivityLogSchema.index({ createdAt: -1 })

export const ActivityLog = (models.ActivityLog || model('ActivityLog', ActivityLogSchema)) as any
