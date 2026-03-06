import { connectDB } from '@/lib/mongodb/client'
import { Chat } from '@/lib/mongodb/models/Chat'
import { Message } from '@/lib/mongodb/models/Message'
import { User } from '@/lib/mongodb/models/User' // Register
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function POST(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { chatId } = await params;
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return NextResponse.json({ error: 'Invalid chat ID format' }, { status: 400 })
    }

    await connectDB()
    
    // Verify user is in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: session.user.id
    })
    
    if (!chat) {
       return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    const message = await Message.create({
      chatId,
      senderId: session.user.id,
      content: content.trim(),
      readBy: [session.user.id]
    })

    // Update the parent chat's last message time
    chat.lastMessageAt = message.createdAt;
    await chat.save();
    
    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name email image role')

    return NextResponse.json(populatedMessage, { status: 201 })
  } catch (error) {
    console.error('POST /api/chats/[chatId]/messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
