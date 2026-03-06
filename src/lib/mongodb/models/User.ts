import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    title: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

UserSchema.index({ email: 1 }, { unique: true })

export const User = models.User || model('User', UserSchema)
