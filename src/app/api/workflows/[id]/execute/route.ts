import { connectDB } from '@/lib/mongodb/client'
import { Workflow } from '@/lib/mongodb/models/Workflow'
import { Lead } from '@/lib/mongodb/models/Lead'
import { WorkflowExecution } from '@/lib/mongodb/models/WorkflowExecution'
import { executeStep } from '@/lib/engine/WorkflowEngine'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

// ── Sample lead data for AI-generated leads ──
const SAMPLE_FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skyler', 'Dakota', 'Jamie', 'Drew', 'Reese', 'Hayden', 'Peyton', 'Cameron', 'Parker', 'Finley', 'Rowan', 'Sage']
const SAMPLE_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Harris', 'Clark', 'Lewis']
const SAMPLE_COMPANIES = ['TechNova Inc', 'CloudScale Labs', 'DataPulse AI', 'GreenLeaf Solutions', 'QuantumBridge', 'NexGen Systems', 'BlueShift Analytics', 'PivotPoint SaaS', 'Horizon Digital', 'StackForge', 'BrightPath Co', 'VeloCity Tech', 'Aperture Labs', 'SilverLine Solutions', 'OmniCore']
const SAMPLE_TITLES = ['CEO', 'CTO', 'VP of Sales', 'Head of Marketing', 'Product Manager', 'Director of Engineering', 'CMO', 'Sales Manager', 'Growth Lead', 'Head of Operations', 'VP of Business Development', 'Founder', 'Co-Founder', 'Chief Revenue Officer', 'Head of Partnerships']

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateSampleLeads(count: number, ownerId: string) {
  const leads = []
  for (let i = 0; i < count; i++) {
    const first = randomPick(SAMPLE_FIRST_NAMES)
    const last = randomPick(SAMPLE_LAST_NAMES)
    const company = randomPick(SAMPLE_COMPANIES)
    leads.push({
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      company,
      title: randomPick(SAMPLE_TITLES),
      linkedinUrl: '',
      phone: '',
      status: 'new',
      ownerId,
    })
  }
  return leads
}

/**
 * Execute a workflow.
 * 
 * If N8N_EXECUTE_WEBHOOK_URL is set, the workflow payload is forwarded
 * to the n8n webhook for external execution (email, AI, etc.).
 * Otherwise, the built-in local engine is used as a fallback.
 * 
 * If the workflow contains a "generateLeads" node with source "ai_generated",
 * sample leads are created in the database before the workflow runs.
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

    // Parse optional runtime inputs from request body
    const body = await req.json().catch(() => ({}))

    // ── Pre-process: Handle generateLeads nodes ──
    let leadsGenerated = 0
    const generateLeadNodes = (workflow.nodes as any[]).filter((n: any) => n.type === 'generateLeads')
    for (const glNode of generateLeadNodes) {
      const nodeData = glNode.data || {}
      const count = Math.min(nodeData.leadCount || 10, 100)
      const source = nodeData.leadSource || 'manual'

      if (source === 'ai_generated') {
        const sampleLeads = generateSampleLeads(count, session.user.id)
        await Lead.insertMany(sampleLeads)
        leadsGenerated += sampleLeads.length
      }
      // For 'manual' source, leads should already exist (imported via CSV)
    }

    // ── n8n Webhook Execution Path (optional — only if explicitly configured) ──
    const n8nUrl = process.env.N8N_EXECUTE_WEBHOOK_URL
    const useN8n = n8nUrl && body.engine === 'n8n'
    if (useN8n) {
      const n8nPayload = {
        workflowId: workflow._id,
        workflowName: workflow.name,
        userId: session.user.id,
        nodes: workflow.nodes,
        edges: workflow.edges,
        config: workflow.config,
        inputs: body.inputs || {},
        leadsGenerated,
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (process.env.N8N_WEBHOOK_SECRET) {
        headers['Authorization'] = `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
      }

      const n8nRes = await fetch(n8nUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(n8nPayload),
      })

      if (!n8nRes.ok) {
        const errText = await n8nRes.text().catch(() => '')
        console.error(`[n8n] Webhook returned ${n8nRes.status}: ${errText.slice(0, 300)}`)
        throw new Error(`n8n responded with status ${n8nRes.status}`)
      }

      const outputs = await n8nRes.json()

      // Log execution to MongoDB
      await WorkflowExecution.create({
        workflowId: workflow._id,
        ownerId: session.user.id,
        status: 'completed',
        currentNodeId: 'n8n',
        stepHistory: [{
          nodeId: 'n8n-webhook',
          nodeType: 'n8n',
          executedAt: new Date(),
          result: 'success',
          messageGenerated: JSON.stringify(outputs).slice(0, 500),
        }],
      })

      workflow.status = 'active'
      await workflow.save()

      return NextResponse.json({ success: true, outputs, engine: 'n8n', leadsGenerated })
    }

    // ── Local Engine Execution Path (fallback) ──
    const leads = await Lead.find({ ownerId: session.user.id, status: 'new' }).limit(50)

    if (leads.length === 0) {
      return NextResponse.json({
        error: 'No new leads to enroll. Import leads or add a "Generate Leads" node with AI Generated source.',
        leadsGenerated,
      }, { status: 400 })
    }

    const executions = await WorkflowExecution.insertMany(
      leads.map((lead: any) => ({
        workflowId: workflow._id,
        leadId: lead._id,
        ownerId: session.user.id,
        status: 'pending',
        currentNodeId: null,
      }))
    )

    await Lead.updateMany(
      { _id: { $in: leads.map((l: any) => l._id) } },
      { $set: { status: 'in_sequence' } }
    )

    workflow.status = 'active'
    await workflow.save()

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
      leadsGenerated,
      engine: 'local',
    })
  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json({ error: 'Failed to execute workflow' }, { status: 500 })
  }
}
