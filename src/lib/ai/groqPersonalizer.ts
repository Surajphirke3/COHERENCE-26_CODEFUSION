import { callGroq } from './groq'

interface GenerateMessageOpts {
  lead: {
    firstName?: string
    lastName?: string
    company?: string
    title?: string
    [key: string]: any
  }
  promptTemplate: string
  tone?: string
  channel?: string
  length?: string
}

function substituteVariables(template: string, lead: GenerateMessageOpts['lead']): string {
  return template
    .replace(/\{\{firstName\}\}/g, lead.firstName || '')
    .replace(/\{\{lastName\}\}/g, lead.lastName || '')
    .replace(/\{\{company\}\}/g, lead.company || '')
    .replace(/\{\{title\}\}/g, lead.title || '')
    .replace(/\{\{fullName\}\}/g, `${lead.firstName || ''} ${lead.lastName || ''}`.trim())
}

export async function generateMessage(opts: GenerateMessageOpts): Promise<string> {
  const { lead, promptTemplate, tone = 'professional', channel = 'email', length = 'medium' } = opts

  const filledPrompt = substituteVariables(promptTemplate, lead)

  const systemPrompt = `You are an expert B2B sales copywriter. Your task is to write a personalized ${channel} message.

Rules:
- Tone: ${tone}
- Length: ${length} (short = 2-3 sentences, medium = 4-6 sentences, long = 7-10 sentences)
- Do NOT include placeholder text like [Your Name] or [Company Name]
- Do NOT include subject lines unless specifically asked
- Return ONLY the message body, nothing else
- Make it feel personal and human, not templated
- Reference the recipient's role/company naturally if provided`

  const message = await callGroq(systemPrompt, filledPrompt)
  return message.trim()
}
