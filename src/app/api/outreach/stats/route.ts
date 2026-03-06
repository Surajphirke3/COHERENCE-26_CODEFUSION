import { connectDB } from '@/lib/mongodb/client'
import { Lead } from '@/lib/mongodb/models/Lead'
import { WorkflowExecution } from '@/lib/mongodb/models/WorkflowExecution'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const ownerId = session.user.id

    // Lead counts by status
    const leadCounts = await Lead.aggregate([
      { $match: { ownerId: ownerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const leadStats: Record<string, number> = {}
    let totalLeads = 0
    for (const item of leadCounts) {
      leadStats[item._id] = item.count
      totalLeads += item.count
    }

    // Execution counts by status
    const execCounts = await WorkflowExecution.aggregate([
      { $match: { ownerId: ownerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const execStats: Record<string, number> = {}
    for (const item of execCounts) {
      execStats[item._id] = item.count
    }

    // Recent executions with lead info
    const executions = await WorkflowExecution.find({ ownerId })
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate('leadId', 'firstName lastName email company status')
      .populate('workflowId', 'name')
      .lean()

    return NextResponse.json({
      total: totalLeads,
      new: leadStats['new'] || 0,
      in_sequence: leadStats['in_sequence'] || 0,
      replied: leadStats['replied'] || 0,
      converted: leadStats['converted'] || 0,
      opted_out: leadStats['opted_out'] || 0,
      bounced: leadStats['bounced'] || 0,
      executions: {
        pending: execStats['pending'] || 0,
        running: execStats['running'] || 0,
        paused: execStats['paused'] || 0,
        completed: execStats['completed'] || 0,
        failed: execStats['failed'] || 0,
        opted_out: execStats['opted_out'] || 0,
      },
      recentExecutions: executions,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
