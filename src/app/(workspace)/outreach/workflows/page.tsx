'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { Plus, GitBranch, Trash2, Play, Pause, Loader2, Mail, Users, Repeat, Zap, X, FileText, Handshake, CalendarCheck, Star, Gift, Megaphone, UserCheck, Award, Target, TrendingUp, Heart, Shield, Briefcase, Globe, Rocket, Phone, MessageCircle, Building, Crown, Lightbulb, RefreshCw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const statusStyles: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'var(--neutral-100)', color: 'var(--text-secondary)' },
  active: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  paused: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
  archived: { bg: 'var(--neutral-100)', color: 'var(--text-tertiary)' },
}

// ── Prebuilt Sales Workflow Templates ──
// These work with REAL leads imported from CSV/Excel.
// Flow: Import leads → Create/pick workflow → Select leads → Execute → AI personalizes → Emails sent
const WORKFLOW_TEMPLATES = [
  {
    key: 'cold-email',
    name: 'Cold Email Outreach',
    description: 'Import your leads from CSV, AI writes a personalized email for each one, and sends it via your SMTP.',
    icon: Mail,
    color: '#1A56DB',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger', description: 'Runs for every lead you select' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Writes Email', nodeType: 'aiMessage', description: 'Generates a personalized cold email using lead data', promptTemplate: 'Write a personalized cold email to {{firstName}} who is {{title}} at {{company}}. Keep it short (3-4 sentences), friendly, and professional. Include a clear call-to-action to book a quick call.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', description: 'Sends the email to the lead via SMTP', subject: '' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted', description: 'Updates lead status to contacted' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'ai_1' },
      { id: 'e2', source: 'ai_1', target: 'send_1' },
      { id: 'e3', source: 'send_1', target: 'tag_1' },
      { id: 'e4', source: 'tag_1', target: 'end_1' },
    ],
  },
  {
    key: 'follow-up-sequence',
    name: 'Multi-Touch Follow-up',
    description: 'AI writes 2 follow-up emails for each lead — a value-add and a case study — then sends them.',
    icon: Repeat,
    color: '#7C3AED',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger', description: 'Runs for every lead you select' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'Email 1: Value Add', nodeType: 'aiMessage', description: 'Share a useful industry insight', promptTemplate: 'Write a follow-up email to {{firstName}} at {{company}}. Share a relevant industry insight or tip. Keep it brief (3-4 sentences) and valuable. End with a soft CTA.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email 1', nodeType: 'sendEmail', subject: '' } },
      { id: 'ai_2', type: 'aiMessage', position: { x: 300, y: 500 }, data: { label: 'Email 2: Case Study', nodeType: 'aiMessage', description: 'Reference a success story', promptTemplate: 'Write a second follow-up email to {{firstName}} at {{company}}. Mention how a similar company achieved great results. Include specific numbers. End with a CTA to schedule a demo.' } },
      { id: 'send_2', type: 'sendEmail', position: { x: 300, y: 650 }, data: { label: 'Send Email 2', nodeType: 'sendEmail', subject: '' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 800 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 950 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'ai_1' },
      { id: 'e2', source: 'ai_1', target: 'send_1' },
      { id: 'e3', source: 'send_1', target: 'ai_2' },
      { id: 'e4', source: 'ai_2', target: 'send_2' },
      { id: 'e5', source: 'send_2', target: 'tag_1' },
      { id: 'e6', source: 'tag_1', target: 'end_1' },
    ],
  },
  {
    key: 'lead-qualifier',
    name: 'Qualify & Outreach',
    description: 'Checks if a lead has company info. If yes, AI writes a tailored email and sends it. If not, skips.',
    icon: Zap,
    color: '#059669',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'condition_1', type: 'condition', position: { x: 300, y: 200 }, data: { label: 'Has Company Info?', nodeType: 'condition', conditionField: 'hasCompany', description: 'Only email leads with company data' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 100, y: 380 }, data: { label: 'AI Writes Email', nodeType: 'aiMessage', description: 'Personalized based on company + role', promptTemplate: 'Write a highly personalized outreach email to {{firstName}}, who is {{title}} at {{company}}. Reference their company specifically. Include a clear value proposition in 3-4 sentences.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 100, y: 530 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'tag_yes', type: 'tagLead', position: { x: 100, y: 680 }, data: { label: 'Mark In Sequence', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'tag_no', type: 'tagLead', position: { x: 500, y: 380 }, data: { label: 'Skip (No Company)', nodeType: 'tagLead', tag: 'new', description: 'Lead stays as new — needs enrichment' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 830 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'condition_1' },
      { id: 'e2', source: 'condition_1', target: 'ai_1' },
      { id: 'e3', source: 'condition_1', target: 'tag_no' },
      { id: 'e4', source: 'ai_1', target: 'send_1' },
      { id: 'e5', source: 'send_1', target: 'tag_yes' },
      { id: 'e6', source: 'tag_yes', target: 'end_1' },
      { id: 'e7', source: 'tag_no', target: 'end_1' },
    ],
  },
  {
    key: 'warm-intro',
    name: 'Warm Introduction',
    description: 'AI writes a friendly, warm intro email referencing common ground. Great for networking leads.',
    icon: Handshake,
    color: '#f59e0b',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger', description: 'Runs for every selected lead' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Warm Intro', nodeType: 'aiMessage', description: 'Writes a friendly intro finding common ground', promptTemplate: 'Write a warm, friendly introduction email to {{firstName}} who is {{title}} at {{company}}. Find common ground based on their role. Be genuine, not salesy. Mention you admire their work. Keep it to 3-4 sentences. End with a simple question to start a conversation.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Intro', nodeType: 'sendEmail', subject: '' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'ai_1' },
      { id: 'e2', source: 'ai_1', target: 'send_1' },
      { id: 'e3', source: 'send_1', target: 'tag_1' },
      { id: 'e4', source: 'tag_1', target: 'end_1' },
    ],
  },
  {
    key: 'meeting-request',
    name: 'Meeting Request',
    description: 'AI writes a concise email requesting a 15-min call, personalized to the lead\'s role and company.',
    icon: CalendarCheck,
    color: '#8b5cf6',
    nodes: [
      { id: 'trigger_1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger', description: 'Runs for every selected lead' } },
      { id: 'ai_1', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Meeting Request', nodeType: 'aiMessage', description: 'Writes a short meeting request email', promptTemplate: 'Write a short email to {{firstName}}, {{title}} at {{company}}, requesting a 15-minute call. Mention one specific reason relevant to their role why the call would be valuable. Include 2 suggested time slots (this week). Keep it to 3 sentences max. Be direct and respectful of their time.' } },
      { id: 'send_1', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Request', nodeType: 'sendEmail', subject: '' } },
      { id: 'tag_1', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark In Sequence', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'end_1', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'ai_1' },
      { id: 'e2', source: 'ai_1', target: 'send_1' },
      { id: 'e3', source: 'send_1', target: 'tag_1' },
      { id: 'e4', source: 'tag_1', target: 'end_1' },
    ],
  },
  // ── 6. Product Demo Invite ──
  { key: 'demo-invite', name: 'Product Demo Invite', description: 'AI writes a personalized demo invitation highlighting benefits relevant to the lead\'s role.', icon: Rocket, color: '#ec4899',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Demo Invite', nodeType: 'aiMessage', promptTemplate: 'Write a short email inviting {{firstName}} ({{title}} at {{company}}) to a personalized product demo. Highlight 1-2 benefits specific to their role. Offer 2 time slots. Keep it under 4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Invite', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 7. Customer Re-engagement ──
  { key: 'reengagement', name: 'Customer Re-engagement', description: 'Win back churned or inactive customers with a personalized "we miss you" email.', icon: RefreshCw, color: '#06b6d4',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Re-engagement', nodeType: 'aiMessage', promptTemplate: 'Write a friendly re-engagement email to {{firstName}} at {{company}}. Acknowledge they haven\'t been active. Share one new feature or improvement. Offer a special incentive to come back. Keep it warm and 3-4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 8. Referral Request ──
  { key: 'referral', name: 'Referral Request', description: 'Ask happy customers for referrals with a personalized, non-pushy email.', icon: Star, color: '#eab308',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Referral Ask', nodeType: 'aiMessage', promptTemplate: 'Write a friendly email to {{firstName}} at {{company}} asking if they know anyone who might benefit from our solution. Thank them for being a customer. Make it easy — they just need to reply with a name. Keep it to 3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 9. Event/Webinar Invite ──
  { key: 'event-invite', name: 'Event / Webinar Invite', description: 'Invite leads to your upcoming webinar or event with a personalized pitch.', icon: Megaphone, color: '#f97316',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Event Invite', nodeType: 'aiMessage', promptTemplate: 'Write an email inviting {{firstName}} ({{title}} at {{company}}) to our upcoming webinar. Explain why the topic is relevant to their role. Include date, time, and a registration link placeholder. Keep it to 3-4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Invite', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 10. Partnership Proposal ──
  { key: 'partnership', name: 'Partnership Proposal', description: 'Propose a strategic partnership tailored to the lead\'s company and market position.', icon: Building, color: '#0ea5e9',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Partnership Email', nodeType: 'aiMessage', promptTemplate: 'Write a professional partnership proposal email to {{firstName}}, {{title}} at {{company}}. Suggest a specific way your companies could collaborate based on their market. Be concise — 3-4 sentences. End with a CTA to explore further.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Proposal', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark In Sequence', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 11. Free Trial Offer ──
  { key: 'free-trial', name: 'Free Trial Offer', description: 'Offer leads a free trial personalized to their use case and company size.', icon: Gift, color: '#a855f7',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Trial Offer', nodeType: 'aiMessage', promptTemplate: 'Write an email offering {{firstName}} at {{company}} a free trial. Mention how it solves a challenge relevant to their role as {{title}}. Include trial duration and one key benefit. 3 sentences max.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Offer', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 12. Testimonial/Review Request ──
  { key: 'testimonial', name: 'Testimonial Request', description: 'Ask satisfied customers for a testimonial or review with a warm, easy ask.', icon: Award, color: '#14b8a6',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Testimonial Ask', nodeType: 'aiMessage', promptTemplate: 'Write a warm email to {{firstName}} at {{company}} asking for a brief testimonial or review. Thank them for being a customer. Make it easy — suggest they reply with 2-3 sentences about their experience. Keep your email to 3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Request', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 13. Upsell/Cross-sell ──
  { key: 'upsell', name: 'Upsell / Cross-sell', description: 'Suggest additional products or upgrades based on the customer\'s current usage.', icon: TrendingUp, color: '#22c55e',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Upsell Email', nodeType: 'aiMessage', promptTemplate: 'Write an email to {{firstName}} at {{company}} suggesting an upgrade or additional product. Reference their current role as {{title}} and how the upgrade would help them specifically. Be helpful, not pushy. 3-4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 14. Thank You / Post-Meeting ──
  { key: 'thank-you', name: 'Post-Meeting Thank You', description: 'Send a personalized thank-you email after a meeting or call.', icon: Heart, color: '#ef4444',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Thank You', nodeType: 'aiMessage', promptTemplate: 'Write a thank-you email to {{firstName}} ({{title}} at {{company}}) after a recent meeting. Reference their role and express genuine appreciation. Mention one key takeaway from the discussion. Suggest a next step. 3-4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Thank You', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 15. Competitor Switch ──
  { key: 'competitor-switch', name: 'Competitor Switch Pitch', description: 'Target leads using a competitor with a tailored "why switch" email.', icon: Target, color: '#dc2626',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Switch Pitch', nodeType: 'aiMessage', promptTemplate: 'Write a tactful email to {{firstName}} ({{title}} at {{company}}) explaining why they should consider switching from their current solution. Don\'t bad-mouth competitors. Focus on 2 unique advantages. Be respectful and concise — 3-4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 16. Onboarding Welcome ──
  { key: 'onboarding', name: 'Onboarding Welcome', description: 'Welcome new customers with a personalized onboarding email and next steps.', icon: UserCheck, color: '#10b981',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Welcome Email', nodeType: 'aiMessage', promptTemplate: 'Write a warm welcome email to {{firstName}} at {{company}} who just signed up. Congratulate them, give 3 quick steps to get started, and offer to help. Reference their role as {{title}}. 4-5 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Welcome', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark In Sequence', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 17. Content Share ──
  { key: 'content-share', name: 'Content / Blog Share', description: 'Share a relevant blog post or resource tailored to the lead\'s industry.', icon: FileText, color: '#6366f1',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Content Email', nodeType: 'aiMessage', promptTemplate: 'Write a short email to {{firstName}} ({{title}} at {{company}}) sharing a relevant blog post or resource. Explain why it\'s useful for their role. Include a placeholder link. Keep it to 2-3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 18. Feedback Request ──
  { key: 'feedback', name: 'Feedback Request', description: 'Ask customers for product feedback with a personalized, easy-to-answer email.', icon: MessageCircle, color: '#8b5cf6',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Feedback Ask', nodeType: 'aiMessage', promptTemplate: 'Write a short email to {{firstName}} at {{company}} asking for quick feedback on their experience. Ask one specific question. Make it easy to reply. Thank them in advance. 3 sentences max.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 19. Seasonal/Holiday Outreach ──
  { key: 'seasonal', name: 'Seasonal / Holiday Email', description: 'Send a seasonal greeting with a soft pitch tied to the time of year.', icon: Crown, color: '#d946ef',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Seasonal Email', nodeType: 'aiMessage', promptTemplate: 'Write a friendly seasonal email to {{firstName}} at {{company}}. Start with a warm greeting. Briefly mention how your solution can help them prepare for the upcoming quarter. Keep it light and 3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 20. Industry Report Share ──
  { key: 'industry-report', name: 'Industry Report Share', description: 'Share industry insights or a report relevant to the lead\'s sector.', icon: Globe, color: '#0891b2',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Report Email', nodeType: 'aiMessage', promptTemplate: 'Write an email to {{firstName}} ({{title}} at {{company}}) sharing a key finding from a recent industry report. Make the insight relevant to their company. Offer to share the full report. 3-4 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 21. Job Change Congratulations ──
  { key: 'job-change', name: 'Job Change Congrats', description: 'Congratulate leads who recently changed jobs and re-introduce your product.', icon: Briefcase, color: '#f59e0b',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Congrats Email', nodeType: 'aiMessage', promptTemplate: 'Write a congratulatory email to {{firstName}} on their new role as {{title}} at {{company}}. Be genuine. Briefly mention how your product could help in their new position. Keep it warm and 3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 22. Quick Question ──
  { key: 'quick-question', name: 'Quick Question', description: 'Start a conversation by asking the lead one relevant question about their challenges.', icon: Lightbulb, color: '#84cc16',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Question Email', nodeType: 'aiMessage', promptTemplate: 'Write a very short email to {{firstName}} ({{title}} at {{company}}) asking one thoughtful question about a challenge they likely face in their role. Don\'t pitch anything. Just start a conversation. 2 sentences max.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 23. Phone Call Request ──
  { key: 'phone-call', name: 'Phone Call Request', description: 'Ask for a quick 5-minute phone call instead of a formal meeting.', icon: Phone, color: '#059669',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Call Request', nodeType: 'aiMessage', promptTemplate: 'Write a very brief email to {{firstName}} at {{company}} asking for a 5-minute phone call. Explain one specific thing you\'d like to discuss related to their role as {{title}}. Include your phone number placeholder. 2-3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark In Sequence', nodeType: 'tagLead', tag: 'in_sequence' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 24. Case Study Offer ──
  { key: 'case-study', name: 'Case Study Offer', description: 'Offer to share a relevant case study from a similar company in their industry.', icon: Shield, color: '#64748b',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Case Study Email', nodeType: 'aiMessage', promptTemplate: 'Write an email to {{firstName}} ({{title}} at {{company}}) offering to share a case study from a company similar to theirs. Mention specific results (e.g., "40% increase in efficiency"). Ask if they\'d like to see it. 3 sentences.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
  // ── 25. Breakup / Final Follow-up ──
  { key: 'breakup', name: 'Breakup / Final Email', description: 'A friendly final follow-up letting the lead know this is your last message. Keeps the door open.', icon: Mail, color: '#78716c',
    nodes: [
      { id: 't', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'For Each Lead', nodeType: 'trigger' } },
      { id: 'a', type: 'aiMessage', position: { x: 300, y: 200 }, data: { label: 'AI Breakup Email', nodeType: 'aiMessage', promptTemplate: 'Write a friendly "breakup" email to {{firstName}} at {{company}}. Let them know this is your last follow-up. Be respectful of their time. Keep the door open for future conversations. 3 sentences max. No guilt-tripping.' } },
      { id: 's', type: 'sendEmail', position: { x: 300, y: 350 }, data: { label: 'Send Final Email', nodeType: 'sendEmail', subject: '' } },
      { id: 'g', type: 'tagLead', position: { x: 300, y: 500 }, data: { label: 'Mark Contacted', nodeType: 'tagLead', tag: 'contacted' } },
      { id: 'e', type: 'end', position: { x: 300, y: 650 }, data: { label: 'Done', nodeType: 'end' } },
    ],
    edges: [{ id: 'e1', source: 't', target: 'a' }, { id: 'e2', source: 'a', target: 's' }, { id: 'e3', source: 's', target: 'g' }, { id: 'e4', source: 'g', target: 'e' }],
  },
]

export default function WorkflowsPage() {
  const { data, isLoading } = useSWR('/api/workflows', fetcher)
  const [creating, setCreating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const workflows = data?.workflows || []

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Workflow' }),
      })
      const result = await res.json()
      if (res.ok && result.workflow) {
        window.location.href = `/outreach/workflows/${result.workflow._id}/builder`
      }
    } finally {
      setCreating(false)
    }
  }

  const handleCreateFromTemplate = async (template: typeof WORKFLOW_TEMPLATES[0]) => {
    setCreating(true)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          nodes: template.nodes,
          edges: template.edges,
        }),
      })
      const result = await res.json()
      if (res.ok && result.workflow) {
        window.location.href = `/outreach/workflows/${result.workflow._id}/builder`
      }
    } finally {
      setCreating(false)
      setShowTemplates(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return
    await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
    mutate('/api/workflows')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Workflows</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            Design and manage your outreach sequences
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-ghost"
            onClick={() => setShowTemplates(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-subtle)', padding: '8px 14px', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 500 }}
          >
            <FileText size={16} /> Use Template
          </button>
          <button className="btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
            Blank Workflow
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          Loading...
        </div>
      ) : workflows.length === 0 ? (
        <div>
          <div className="card" style={{ padding: '48px', textAlign: 'center', marginBottom: '32px' }}>
            <GitBranch size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 500, marginBottom: '4px' }}>No workflows yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
              Start from scratch or pick a prebuilt sales template
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                <Plus size={16} /> Blank Workflow
              </button>
              <button
                className="btn-ghost"
                onClick={() => setShowTemplates(true)}
                style={{ border: '1px solid var(--border-subtle)', padding: '8px 14px', borderRadius: 'var(--radius)' }}
              >
                <FileText size={16} /> Use Template
              </button>
            </div>
          </div>

          {/* Show templates inline when no workflows */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Sales Templates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {WORKFLOW_TEMPLATES.map(tpl => {
                const Icon = tpl.icon
                return (
                  <button
                    key={tpl.key}
                    className="card"
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creating}
                    style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', transition: 'all 150ms ease', width: '100%' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${tpl.color}30` }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: tpl.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={tpl.color} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{tpl.name}</div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0 }}>{tpl.description}</p>
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {tpl.nodes.length} nodes · {tpl.edges.length} connections
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {workflows.map((wf: any) => {
            const style = statusStyles[wf.status] || statusStyles.draft
            return (
              <div key={wf._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <GitBranch size={18} color="var(--brand-600)" />
                  </div>
                  <div>
                    <Link
                      href={`/outreach/workflows/${wf._id}/builder`}
                      style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {wf.name}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {wf.nodes?.length || 0} nodes · Updated {new Date(wf.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500,
                    background: style.bg, color: style.color,
                  }}>
                    {wf.status}
                  </span>
                  {wf.status === 'active' ? (
                    <button className="btn-ghost" style={{ padding: '4px' }} title="Pause">
                      <Pause size={14} />
                    </button>
                  ) : wf.status === 'draft' ? (
                    <Link href={`/outreach/workflows/${wf._id}/builder`} className="btn-ghost" style={{ padding: '4px' }} title="Edit">
                      <Play size={14} />
                    </Link>
                  ) : null}
                  <button className="btn-ghost" style={{ padding: '4px', color: 'var(--text-tertiary)' }} onClick={() => handleDelete(wf._id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Template Picker Modal */}
      {showTemplates && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowTemplates(false)}
        >
          <div
            style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '24px', maxWidth: '720px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Sales Workflow Templates</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Choose a template to get started quickly</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {WORKFLOW_TEMPLATES.map(tpl => {
                const Icon = tpl.icon
                return (
                  <button
                    key={tpl.key}
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creating}
                    style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'var(--bg-elevated)', transition: 'all 150ms ease', width: '100%' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${tpl.color}30` }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: tpl.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={tpl.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{tpl.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{tpl.nodes.length} nodes</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{tpl.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
