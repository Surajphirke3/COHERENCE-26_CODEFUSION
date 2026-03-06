import { Schema, model, models } from 'mongoose'

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

AnnouncementSchema.index({ isActive: 1, expiresAt: 1 })

export const Announcement = (models.Announcement || model('Announcement', AnnouncementSchema)) as any
