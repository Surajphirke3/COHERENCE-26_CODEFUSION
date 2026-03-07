import { Schema, model, models } from 'mongoose'

const LeadSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_sequence', 'replied', 'converted', 'opted_out', 'bounced'],
      default: 'new',
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

LeadSchema.index({ ownerId: 1, status: 1 })
LeadSchema.index({ email: 1, ownerId: 1 })

export const Lead = (models.Lead || model('Lead', LeadSchema)) as any
