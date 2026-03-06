import { connectDB } from '@/lib/mongodb/client'
import { Doc } from '@/lib/mongodb/models/Document'
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
    const search = searchParams.get('search')
    const type = searchParams.get('type')

    let filter: Record<string, unknown> = {}
    if (type) filter.type = type
    if (search) filter.$text = { $search: search }

    const docs = await Doc.find(filter)
      .populate('authorId', 'name avatarUrl')
      .populate('projectId', 'name color')
      .sort({ isPinned: -1, updatedAt: -1 })

    return NextResponse.json(docs)
  } catch (error) {
    console.error('GET /api/docs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const doc = await Doc.create({
      ...body,
      authorId: session.user.id,
    })

    await ActivityLog.create({
      actorId: session.user.id,
      action: 'created_document',
      entityType: 'document',
      entityId: doc._id,
      entityTitle: doc.title,
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('POST /api/docs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
