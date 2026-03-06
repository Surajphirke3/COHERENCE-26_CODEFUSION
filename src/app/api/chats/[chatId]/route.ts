import { connectDB } from '@/lib/mongodb/client'
import { Chat } from '@/lib/mongodb/models/Chat'
import { Message } from '@/lib/mongodb/models/Message'
import { User } from '@/lib/mongodb/models/User' // Keep to register model
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chatId } = await params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID format' }, { status: 400 })
    }

    await connectDB()
    const chat = await Chat.findOne({
      _id: chatId,
      participants: session.user.id
    }).populate('participants', 'name email image role')

    if (!chat) {
       return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name email image role')
      .sort({ createdAt: 1 })

    return NextResponse.json({ chat, messages })
  } catch (error) {
    console.error('GET /api/chats/[chatId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
