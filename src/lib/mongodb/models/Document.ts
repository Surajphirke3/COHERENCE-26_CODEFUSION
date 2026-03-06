import { Schema, model, models } from 'mongoose'

const DocumentSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed },
    type: {
      type: String,
      enum: ['prd', 'meeting_notes', 'technical', 'general'],
      default: 'general',
    },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
)

DocumentSchema.index({ title: 'text' })
DocumentSchema.index({ type: 1 })
DocumentSchema.index({ isPinned: -1, updatedAt: -1 })

export const Doc = models.Doc || model('Doc', DocumentSchema)
