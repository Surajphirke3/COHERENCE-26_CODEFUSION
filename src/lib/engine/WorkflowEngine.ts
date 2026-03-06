import { connectDB } from '@/lib/mongodb/client'
import { WorkflowExecution } from '@/lib/mongodb/models/WorkflowExecution'
import { Workflow } from '@/lib/mongodb/models/Workflow'
import { Lead } from '@/lib/mongodb/models/Lead'
import { generateMessage } from '@/lib/ai/groqPersonalizer'
import { checkRateLimit } from './RateLimiter'
import { computeDelay, nextExecTime } from './DelayScheduler'
import { safetyCheck } from './SafetyGuards'

/**
 * Execute a single step in a workflow for a given execution.
 */
export async function executeStep(executionId: string): Promise<void> {
  await connectDB()

  const execution = await WorkflowExecution.findById(executionId)
  if (!execution) throw new Error('Execution not found')

  if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'opted_out') {
    return
  }

  const lead = await Lead.findById(execution.leadId)
  if (!lead) {
    execution.status = 'failed'
    execution.errorMessage = 'Lead not found'
    await execution.save()
    return
  }

  // Safety check
  const safety = safetyCheck({ email: lead.email, status: lead.status })
  if (!safety.safe) {
    execution.status = lead.status === 'opted_out' ? 'opted_out' : 'failed'
    execution.errorMessage = safety.reason
    await execution.save()
    return
  }

  // Rate limit check
  const rateCheck = checkRateLimit(execution.ownerId.toString())
  if (!rateCheck.allowed) {
    execution.status = 'paused'
    execution.errorMessage = rateCheck.reason
    execution.nextExecutionAt = new Date(Date.now() + 10 * 60 * 1000) // retry in 10 min
    await execution.save()
    return
  }

  const workflow = await Workflow.findById(execution.workflowId)
  if (!workflow) {
    execution.status = 'failed'
    execution.errorMessage = 'Workflow not found'
    await execution.save()
    return
  }

  const nodes = workflow.nodes || []
  const edges = workflow.edges || []

  // Find current node
  let currentNode = nodes.find((n: any) => n.id === execution.currentNodeId)
  if (!currentNode && nodes.length > 0) {
    // Start from first node (trigger)
    currentNode = nodes.find((n: any) => n.type === 'trigger') || nodes[0]
    execution.currentNodeId = currentNode.id
  }

  if (!currentNode) {
    execution.status = 'failed'
    execution.errorMessage = 'No nodes in workflow'
    await execution.save()
    return
  }

  const nodeType = currentNode.type
  const nodeData = currentNode.data || {}

  try {
    execution.status = 'running'

    let stepResult = 'success'
    let messageGenerated: string | undefined
    let delayUsed: number | undefined

    switch (nodeType) {
      case 'trigger':
        // Just advance to next node
        break

      case 'aiMessage': {
        const prompt = nodeData.promptTemplate || 'Write a professional outreach email to {{firstName}} at {{company}}'
        const message = await generateMessage({
          lead: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            company: lead.company,
            title: lead.title,
          },
          promptTemplate: prompt,
          tone: nodeData.tone || 'professional',
          channel: nodeData.channel || 'email',
          length: nodeData.length || 'medium',
        })
        messageGenerated = message
        break
      }

      case 'sendEmail':
        // In a real implementation, this would send the email via SMTP
        // For demo, we just log it
        console.log(`[Engine] Would send email to ${lead.email}`)
        break

      case 'delay': {
        const minutes = nodeData.delayMinutes || 60
        const delaySec = computeDelay(minutes * 60 * 0.8, minutes * 60 * 1.2)
        delayUsed = Math.round(delaySec)
        const config = workflow.config || {}
        execution.nextExecutionAt = nextExecTime(delaySec, config.businessHoursOnly)
        execution.status = 'paused'

        execution.stepHistory.push({
          nodeId: currentNode.id,
          nodeType,
          executedAt: new Date(),
          result: 'success',
          delayUsedSeconds: delayUsed,
        })
        await execution.save()
        return // Don't advance — will resume after delay
      }

      case 'condition':
        // Simple condition: check lead status
        break

      case 'tagLead': {
        const tag = nodeData.tag || 'in_sequence'
        lead.status = tag
        await lead.save()
        break
      }

      case 'end':
        execution.status = 'completed'
        execution.stepHistory.push({
          nodeId: currentNode.id,
          nodeType,
          executedAt: new Date(),
          result: 'success',
        })
        await execution.save()
        return
    }

    // Record step
    execution.stepHistory.push({
      nodeId: currentNode.id,
      nodeType,
      executedAt: new Date(),
      result: stepResult,
      messageGenerated,
      delayUsedSeconds: delayUsed,
    })

    // Advance to next node
    const outEdge = edges.find((e: any) => e.source === currentNode.id)
    if (outEdge) {
      execution.currentNodeId = outEdge.target
      await execution.save()

      // Execute next step immediately (unless it's a delay)
      const nextNode = nodes.find((n: any) => n.id === outEdge.target)
      if (nextNode && nextNode.type !== 'delay') {
        await executeStep(executionId)
      } else {
        await executeStep(executionId)
      }
    } else {
      // No more nodes — complete
      execution.status = 'completed'
      await execution.save()
    }
  } catch (error: any) {
    execution.status = 'failed'
    execution.errorMessage = error.message || 'Unknown error'
    execution.stepHistory.push({
      nodeId: currentNode.id,
      nodeType,
      executedAt: new Date(),
      result: 'failed',
    })
    await execution.save()
  }
}
