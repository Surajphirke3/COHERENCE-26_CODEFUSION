import { connectDB } from '@/lib/mongodb/client'
import { Doc } from '@/lib/mongodb/models/Document'
import { ActivityLog } from '@/lib/mongodb/models/ActivityLog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const doc = await Doc.findById(id)
      .populate('authorId', 'name avatarUrl email')
      .populate('projectId', 'name color')

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('GET /api/docs/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const body = await req.json()

    const doc = await Doc.findByIdAndUpdate(id, body, { new: true })
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    await ActivityLog.create({
      actorId: session.user.id,
      action: 'updated_document',
      entityType: 'document',
      entityId: doc._id,
      entityTitle: doc.title,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('PATCH /api/docs/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params

    const doc = await Doc.findById(id)
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    await Doc.findByIdAndDelete(id)

    await ActivityLog.create({
      actorId: session.user.id,
      action: 'deleted_document',
      entityType: 'document',
      entityId: doc._id,
      entityTitle: doc.title,
    })

    return NextResponse.json({ message: 'Document deleted' })
  } catch (error) {
    console.error('DELETE /api/docs/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
