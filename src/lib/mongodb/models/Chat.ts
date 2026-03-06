import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema)
