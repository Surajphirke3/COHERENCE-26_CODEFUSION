import { Schema, model, models } from 'mongoose'

const UserSettingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Email configuration (Gmail + App Password)
    emailProvider: { type: String, default: 'gmail' },
    emailAddress: { type: String, default: '' },
    emailAppPassword: { type: String, default: '' },
    emailFromName: { type: String, default: '' },
    // AI configuration
    aiProvider: { type: String, default: 'groq' },
    aiApiKey: { type: String, default: '' },
    aiModel: { type: String, default: 'llama-3.3-70b-versatile' },
    aiBaseUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

export const UserSettings = (models.UserSettings || model('UserSettings', UserSettingsSchema)) as any
