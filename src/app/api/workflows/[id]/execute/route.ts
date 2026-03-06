import { connectDB } from '@/lib/mongodb/client'
import { Workflow } from '@/lib/mongodb/models/Workflow'
import { Lead } from '@/lib/mongodb/models/Lead'
import { WorkflowExecution } from '@/lib/mongodb/models/WorkflowExecution'
import { executeStep } from '@/lib/engine/WorkflowEngine'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const workflow = await Workflow.findOne({ _id: id, ownerId: session.user.id })
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      return NextResponse.json({ error: 'Workflow has no nodes' }, { status: 400 })
    }

    // Find leads with status 'new' to enroll
    const leads = await Lead.find({ ownerId: session.user.id, status: 'new' }).limit(50)

    if (leads.length === 0) {
      return NextResponse.json({ error: 'No new leads to enroll' }, { status: 400 })
    }

    // Create execution records
    const executions = await WorkflowExecution.insertMany(
      leads.map((lead: any) => ({
        workflowId: workflow._id,
        leadId: lead._id,
        ownerId: session.user.id,
        status: 'pending',
        currentNodeId: null,
      }))
    )

    // Update lead statuses
    await Lead.updateMany(
      { _id: { $in: leads.map((l: any) => l._id) } },
      { $set: { status: 'in_sequence' } }
    )

    // Mark workflow as active
    workflow.status = 'active'
    await workflow.save()

    // Execute first batch (up to 5) immediately
    const firstBatch = executions.slice(0, 5)
    for (const exec of firstBatch) {
      try {
        await executeStep(exec._id.toString())
      } catch (err) {
        console.error(`[Engine] Failed to execute step for ${exec._id}:`, err)
      }
    }

    return NextResponse.json({
      message: `Workflow started for ${leads.length} leads`,
      executionCount: executions.length,
    })
  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json({ error: 'Failed to start workflow' }, { status: 500 })
  }
}
