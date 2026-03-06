import { connectDB } from '@/lib/mongodb/client'
import { Project } from '@/lib/mongodb/models/Project'
import { ActivityLog } from '@/lib/mongodb/models/ActivityLog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const projects = await Project.find()
      .populate('ownerId', 'name avatarUrl')
      .populate('members', 'name avatarUrl')
      .sort({ updatedAt: -1 })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const project = await Project.create({
      ...body,
      ownerId: session.user.id,
      members: [session.user.id, ...(body.members || [])],
    })

    await ActivityLog.create({
      actorId: session.user.id,
      action: 'created_project',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
