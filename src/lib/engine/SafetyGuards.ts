/**
 * Safety Guards for workflow execution.
 * Validates leads before sending outreach and detects opt-out keywords.
 */

const OPT_OUT_KEYWORDS = [
  'unsubscribe',
  'opt out',
  'opt-out',
  'remove me',
  'stop emailing',
  'not interested',
  'please remove',
  'do not contact',
  'take me off',
]

export function detectOptOut(text: string): boolean {
  const lower = text.toLowerCase()
  return OPT_OUT_KEYWORDS.some(keyword => lower.includes(keyword))
}

export function safetyCheck(lead: {
  email?: string
  status?: string
}): { safe: boolean; reason?: string } {
  if (!lead.email) {
    return { safe: false, reason: 'Lead has no email address' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(lead.email)) {
    return { safe: false, reason: 'Invalid email format' }
  }

  if (lead.status === 'opted_out') {
    return { safe: false, reason: 'Lead has opted out' }
  }

  if (lead.status === 'bounced') {
    return { safe: false, reason: 'Lead email has bounced' }
  }

  return { safe: true }
}
