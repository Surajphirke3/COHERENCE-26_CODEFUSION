import { connectDB } from '@/lib/mongodb/client'
import { ActivityLog } from '@/lib/mongodb/models/ActivityLog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const logs = await ActivityLog.find()
      .populate('actorId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error('GET /api/activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
