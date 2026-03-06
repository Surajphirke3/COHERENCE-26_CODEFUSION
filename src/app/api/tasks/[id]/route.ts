import { connectDB } from '@/lib/mongodb/client'
import { Task } from '@/lib/mongodb/models/Task'
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
    const task = await Task.findById(id)
      .populate('assigneeId', 'name avatarUrl email')
      .populate('createdBy', 'name')
      .populate('projectId', 'name color')

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    return NextResponse.json(task)
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error)
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

    const oldTask = await Task.findById(id)
    if (!oldTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const task = await Task.findByIdAndUpdate(id, body, { new: true })

    // Log status changes specifically
    if (body.status && body.status !== oldTask.status) {
      await ActivityLog.create({
        actorId: session.user.id,
        action: 'moved_task',
        entityType: 'task',
        entityId: task!._id,
        entityTitle: task!.title,
        metadata: { from: oldTask.status, to: body.status },
      })
    } else {
      await ActivityLog.create({
        actorId: session.user.id,
        action: 'updated_task',
        entityType: 'task',
        entityId: task!._id,
        entityTitle: task!.title,
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params

    const task = await Task.findById(id)
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    await Task.findByIdAndDelete(id)

    await ActivityLog.create({
      actorId: session.user.id,
      action: 'deleted_task',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
    })

    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
