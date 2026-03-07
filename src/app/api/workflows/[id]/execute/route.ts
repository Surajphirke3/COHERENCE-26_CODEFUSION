import { connectDB } from '@/lib/mongodb/client'
import { Workflow } from '@/lib/mongodb/models/Workflow'
import { Lead } from '@/lib/mongodb/models/Lead'
import { WorkflowExecution } from '@/lib/mongodb/models/WorkflowExecution'
import { executeStep } from '@/lib/engine/WorkflowEngine'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

/**
 * Execute a workflow against REAL leads.
 *
 * Request body:
 *   leadIds?: string[]  — specific lead IDs to enroll (from the lead picker)
 *   status?: string     — if no leadIds, enroll all leads with this status (default: 'new')
 *   limit?: number      — max leads to enroll (default: 50)
 *
 * For each selected lead, the engine runs the workflow nodes in order:
 *   Trigger → AI Message (calls your AI API) → Send Email (via SMTP) → Tag Lead → End
 */
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

    const body = await req.json().catch(() => ({}))
    const { leadIds, status: filterStatus, limit: maxLeads } = body

    // ── Find leads to enroll ──
    let leads: any[]

    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      // Specific leads selected by user
      leads = await Lead.find({
        _id: { $in: leadIds },
        ownerId: session.user.id,
      })
    } else {
      // All leads with the given status (default: 'new')
      leads = await Lead.find({
        ownerId: session.user.id,
        status: filterStatus || 'new',
      }).limit(maxLeads || 50)
    }

    if (leads.length === 0) {
      return NextResponse.json({
        error: 'No leads found. Import leads from CSV/Excel first in the Leads page, then come back and execute.',
      }, { status: 400 })
    }

    // ── Create execution records for each lead ──
    const executions = await WorkflowExecution.insertMany(
      leads.map((lead: any) => ({
        workflowId: workflow._id,
        leadId: lead._id,
        ownerId: session.user.id,
        status: 'pending',
        currentNodeId: null,
      }))
    )

    // Mark leads as in_sequence
    await Lead.updateMany(
      { _id: { $in: leads.map((l: any) => l._id) } },
      { $set: { status: 'in_sequence' } }
    )

    workflow.status = 'active'
    await workflow.save()

    // ── Execute workflow for each lead ──
    const results: { leadName: string; status: string; error?: string }[] = []

    for (const exec of executions) {
      try {
        await executeStep(exec._id.toString())
        const updated = await WorkflowExecution.findById(exec._id).lean() as any
        const lead = leads.find((l: any) => l._id.toString() === exec.leadId.toString())
        results.push({
          leadName: lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown',
          status: updated?.status || 'completed',
          error: updated?.errorMessage,
        })
      } catch (err: any) {
        results.push({
          leadName: 'Unknown',
          status: 'failed',
          error: err.message,
        })
      }
    }

    const succeeded = results.filter(r => r.status === 'completed').length
    const failed = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      message: `Workflow executed for ${leads.length} lead${leads.length !== 1 ? 's' : ''} — ${succeeded} succeeded, ${failed} failed`,
      total: leads.length,
      succeeded,
      failed,
      results,
      engine: 'local',
    })
  } catch (error: any) {
    console.error('Workflow execution error:', error)
    return NextResponse.json({ error: error.message || 'Failed to execute workflow' }, { status: 500 })
  }
}
