import { connectDB } from '@/lib/mongodb/client'
import { Task } from '@/lib/mongodb/models/Task'
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
    const projectId = searchParams.get('projectId')
    const mine = searchParams.get('mine')

    let filter: Record<string, unknown> = {}
    if (projectId) filter.projectId = projectId
    if (mine === 'true') filter.assigneeId = session.user.id

    const tasks = await Task.find(filter)
      .populate('assigneeId', 'name avatarUrl')
      .populate('createdBy', 'name')
      .sort({ status: 1, position: 1, createdAt: -1 })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    // Get the next position in this status column
    const lastTask = await Task.findOne({
      projectId: body.projectId,
      status: body.status || 'todo',
    }).sort({ position: -1 })

    const task = await Task.create({
      ...body,
      createdBy: session.user.id,
      position: lastTask ? lastTask.position + 1 : 0,
    })

    await ActivityLog.create({
      actorId: session.user.id,
      action: 'created_task',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
