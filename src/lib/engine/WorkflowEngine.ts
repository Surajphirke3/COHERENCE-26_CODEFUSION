import { connectDB } from '@/lib/mongodb/client'
import { WorkflowExecution } from '@/lib/mongodb/models/WorkflowExecution'
import { Workflow } from '@/lib/mongodb/models/Workflow'
import { Lead } from '@/lib/mongodb/models/Lead'
import { UserSettings } from '@/lib/mongodb/models/UserSettings'
import { checkRateLimit } from './RateLimiter'
import { computeDelay, nextExecTime } from './DelayScheduler'
import { safetyCheck } from './SafetyGuards'
import nodemailer from 'nodemailer'

// ── AI Provider Base URLs ──
const AI_BASE_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openai: 'https://api.openai.com/v1',
  sambanova: 'https://api.sambanova.ai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  together: 'https://api.together.xyz/v1',
}

// ── Call any OpenAI-compatible AI API ──
async function callAI(
  systemPrompt: string,
  userMessage: string,
  config: { aiProvider?: string; aiApiKey?: string; aiModel?: string; aiBaseUrl?: string }
): Promise<string> {
  const provider = config.aiProvider || 'groq'
  const apiKey = config.aiApiKey || process.env.GROQ_API_KEY || ''
  const model = config.aiModel || 'llama-3.3-70b-versatile'
  const baseUrl = config.aiBaseUrl || AI_BASE_URLS[provider] || AI_BASE_URLS.groq

  if (!apiKey) {
    throw new Error(`No API key configured. Go to Settings → AI Providers and add your API key.`)
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`AI API (${provider}) error ${res.status}: ${errBody.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

// ── Substitute template variables ──
function substituteVars(template: string, lead: any): string {
  return template
    .replace(/\{\{firstName\}\}/g, lead.firstName || '')
    .replace(/\{\{lastName\}\}/g, lead.lastName || '')
    .replace(/\{\{company\}\}/g, lead.company || '')
    .replace(/\{\{title\}\}/g, lead.title || '')
    .replace(/\{\{email\}\}/g, lead.email || '')
    .replace(/\{\{fullName\}\}/g, `${lead.firstName || ''} ${lead.lastName || ''}`.trim())
}

// ── Send email via Gmail SMTP using user's App Password from Settings ──
async function sendEmailViaGmail(
  to: string,
  subject: string,
  body: string,
  emailConfig: {
    emailAddress?: string; emailAppPassword?: string; emailFromName?: string;
  }
): Promise<void> {
  if (!emailConfig.emailAddress || !emailConfig.emailAppPassword) {
    throw new Error('Email not configured. Go to Settings → Email Configuration and add your Gmail + App Password.')
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailConfig.emailAddress,
      pass: emailConfig.emailAppPassword,
    },
  })

  await transporter.sendMail({
    from: emailConfig.emailFromName
      ? `"${emailConfig.emailFromName}" <${emailConfig.emailAddress}>`
      : emailConfig.emailAddress,
    to,
    subject,
    html: body.replace(/\n/g, '<br>'),
    text: body,
  })
}

// ── Load user's email & AI settings from DB ──
async function getUserConfig(ownerId: string) {
  const settings = await UserSettings.findOne({ userId: ownerId }).lean() as any
  return {
    // Email
    emailAddress: settings?.emailAddress || '',
    emailAppPassword: settings?.emailAppPassword || '',
    emailFromName: settings?.emailFromName || '',
    // AI
    aiProvider: settings?.aiProvider || 'groq',
    aiApiKey: settings?.aiApiKey || process.env.GROQ_API_KEY || '',
    aiModel: settings?.aiModel || 'llama-3.3-70b-versatile',
    aiBaseUrl: settings?.aiBaseUrl || '',
  }
}

/**
 * Execute a single step in a workflow for a given execution.
 * Reads email and AI config from the user's Settings (not per-workflow).
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
    execution.nextExecutionAt = new Date(Date.now() + 10 * 60 * 1000)
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
  const wfConfig = workflow.config || {}

  // Load user's email & AI config from Settings
  const userConfig = await getUserConfig(execution.ownerId.toString())

  // Find current node
  let currentNode = nodes.find((n: any) => n.id === execution.currentNodeId)
  if (!currentNode && nodes.length > 0) {
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
      case 'generateLeads':
        // Pass-through nodes — just advance
        break

      case 'aiMessage': {
        const promptTemplate = nodeData.promptTemplate || 'Write a professional outreach email to {{firstName}} at {{company}}'
        const filledPrompt = substituteVars(promptTemplate, lead)

        const systemPrompt = `You are an expert B2B sales copywriter. Write a personalized ${nodeData.channel || 'email'} message.
Rules:
- Tone: ${nodeData.tone || 'professional'}
- Length: ${nodeData.length || 'medium'} (short=2-3 sentences, medium=4-6 sentences, long=7-10 sentences)
- Do NOT include placeholder text like [Your Name] or [Company Name]
- Do NOT include subject lines unless asked
- Return ONLY the message body
- Make it personal and human, not templated`

        // Use AI config from user Settings (falls back to workflow config, then env)
        const aiConfig = {
          aiProvider: userConfig.aiProvider || wfConfig.aiProvider,
          aiApiKey: userConfig.aiApiKey || wfConfig.aiApiKey,
          aiModel: userConfig.aiModel || wfConfig.aiModel,
          aiBaseUrl: userConfig.aiBaseUrl || wfConfig.aiBaseUrl,
        }
        const message = await callAI(systemPrompt, filledPrompt, aiConfig)
        messageGenerated = message
        execution.markModified('stepHistory')
        break
      }

      case 'sendEmail': {
        // Find the most recent AI-generated message from step history
        const lastAiStep = [...(execution.stepHistory || [])].reverse().find(
          (s: any) => s.nodeType === 'aiMessage' && s.messageGenerated
        )
        const emailBody = lastAiStep?.messageGenerated || nodeData.emailBody || 'Hello, I wanted to reach out...'
        const subject = nodeData.subject || `Hey ${lead.firstName}, quick question`

        if (userConfig.emailAddress && userConfig.emailAppPassword) {
          // Send real email via Gmail using user's Settings
          await sendEmailViaGmail(lead.email, subject, emailBody, userConfig)
          messageGenerated = `Sent to ${lead.email}: "${subject}"`
        } else {
          // No email configured — simulated
          console.log(`[Engine] Simulated email to ${lead.email}: ${subject}`)
          messageGenerated = `[Simulated] To: ${lead.email} | Subject: ${subject}\n\nConfigure email in Settings to send real emails.\n\n${emailBody}`
        }
        break
      }

      case 'delay': {
        const minutes = nodeData.delayMinutes || 60
        const delaySec = computeDelay(minutes * 60 * 0.8, minutes * 60 * 1.2)
        delayUsed = Math.round(delaySec)
        execution.nextExecutionAt = nextExecTime(delaySec, wfConfig.businessHoursOnly)
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

      case 'condition': {
        // Evaluate condition and pick the right outgoing edge
        const field = nodeData.conditionField || 'status'
        let conditionMet = false

        switch (field) {
          case 'status':
            conditionMet = lead.status === 'replied' || lead.status === 'converted'
            break
          case 'hasEmail':
            conditionMet = !!lead.email && lead.email.includes('@')
            break
          case 'hasCompany':
            conditionMet = !!lead.company && lead.company.trim().length > 0
            break
          case 'hasPhone':
            conditionMet = !!lead.phone && lead.phone.trim().length > 0
            break
          default:
            conditionMet = false
        }

        // Record the condition step
        execution.stepHistory.push({
          nodeId: currentNode.id,
          nodeType,
          executedAt: new Date(),
          result: 'success',
          messageGenerated: `Condition "${field}": ${conditionMet ? 'TRUE' : 'FALSE'}`,
        })

        // Pick edge: first edge = condition met, second edge = not met
        const outEdges = edges.filter((e: any) => e.source === currentNode.id)
        const targetEdge = conditionMet ? outEdges[0] : (outEdges[1] || outEdges[0])

        if (targetEdge) {
          execution.currentNodeId = targetEdge.target
          await execution.save()
          await executeStep(executionId)
        } else {
          execution.status = 'completed'
          await execution.save()
        }
        return // Already handled edge traversal
      }

      case 'tagLead': {
        const tag = nodeData.tag || 'in_sequence'
        lead.status = tag
        await lead.save()
        messageGenerated = `Tagged lead as "${tag}"`
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
      // Execute next step immediately
      await executeStep(executionId)
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
      messageGenerated: `Error: ${error.message}`,
    })
    await execution.save()
  }
}
