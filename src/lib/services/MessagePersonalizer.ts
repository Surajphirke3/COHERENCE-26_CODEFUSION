// src/lib/services/MessagePersonalizer.ts
import type { ILead } from '@/lib/models';
import { groqService } from './GroqService';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ToneOption = 'formal' | 'casual' | 'consultative' | 'discovery' | 'urgency';

export interface EmailNodeConfig {
  promptTemplate: string;
  subjectTemplate: string;
  tone: ToneOption;
}

export interface PersonalizedMessage {
  subject: string;
  body: string;
  tone: ToneOption;
  leadId: string;
  generatedAt: Date;
  modelUsed: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MODEL_USED = 'llama-3.1-8b-instant';

const TONE_INSTRUCTIONS: Record<ToneOption, string> = {
  formal:
    'Use a professional, polished tone. Maintain respect and formality. Avoid slang.',
  casual:
    'Use a friendly, conversational tone. Be approachable, like messaging a colleague.',
  consultative:
    'Position yourself as a trusted advisor. Ask insightful questions and share expertise.',
  discovery:
    'Focus on learning about the prospect. Ask open-ended questions about their challenges.',
  urgency:
    'Create a sense of time-sensitivity without being pushy. Highlight limited opportunities.',
};

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class MessagePersonalizer {
  /**
   * Build a structured context block from lead data for use as AI prompt context.
   *
   * @param lead - The lead to extract context from
   * @returns A formatted multi-line context string
   */
  buildContext(lead: ILead): string {
    const lines: string[] = [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
    ];
    if (lead.company) lines.push(`Company: ${lead.company}`);
    if (lead.role) lines.push(`Role: ${lead.role}`);
    if (lead.industry) lines.push(`Industry: ${lead.industry}`);
    if (lead.painPoint) lines.push(`Pain Point: ${lead.painPoint}`);
    if (lead.website) lines.push(`Website: ${lead.website}`);
    if (lead.linkedinUrl) lines.push(`LinkedIn: ${lead.linkedinUrl}`);
    if (lead.tags.length > 0) lines.push(`Tags: ${lead.tags.join(', ')}`);
    return lines.join('\n');
  }

  /**
   * Construct a system prompt that instructs the AI to adopt a given tone.
   *
   * @param tone - Desired communication tone
   * @returns The system prompt string
   */
  buildSystemPrompt(tone: ToneOption): string {
    return `You are an expert B2B sales development representative writing a cold outreach email.
${TONE_INSTRUCTIONS[tone]}

IMPORTANT RULES:
- Keep the email concise (under 150 words for the body)
- Make it highly personalised using the provided lead context
- Do NOT use generic filler phrases
- Respond ONLY in the following exact format:

Subject: <your subject line here>
Body: <your email body here>`;
  }

  /**
   * Build the user prompt that combines lead context, template, and node configuration.
   *
   * @param context    - Formatted lead context string
   * @param template   - The prompt template with optional placeholders
   * @param nodeConfig - Workflow email node configuration
   * @returns The user prompt string
   */
  buildUserPrompt(
    context: string,
    template: string,
    nodeConfig: Partial<EmailNodeConfig>,
  ): string {
    return `LEAD CONTEXT:
${context}

TEMPLATE / GUIDELINES:
${template}

${nodeConfig.subjectTemplate ? `PREFERRED SUBJECT LINE STYLE: ${nodeConfig.subjectTemplate}` : ''}

Write a personalised outreach email for this lead. Follow the template guidelines while making the message uniquely relevant to this specific person.`;
  }

  /**
   * Generate a fully personalised email for a lead using AI, with fallback to template substitution.
   *
   * @param lead       - The target lead
   * @param nodeConfig - Email node configuration from the workflow
   * @returns Personalised message result
   */
  async personalizeForLead(
    lead: ILead,
    nodeConfig: EmailNodeConfig,
  ): Promise<PersonalizedMessage> {
    const tone = nodeConfig.tone ?? 'formal';
    const context = this.buildContext(lead);
    const systemPrompt = this.buildSystemPrompt(tone);
    const userPrompt = this.buildUserPrompt(context, nodeConfig.promptTemplate, nodeConfig);

    try {
      const raw = await groqService.generate(
        [{ role: 'user', content: userPrompt }],
        systemPrompt,
      );

      const { subject, body } = this.extractSubjectAndBody(raw);

      // Validate output
      if (!subject || !body || body.length < 20 || body.length > 5000) {
        return this.fallbackMessage(lead, nodeConfig, tone);
      }

      return {
        subject,
        body,
        tone,
        leadId: lead._id.toString(),
        generatedAt: new Date(),
        modelUsed: MODEL_USED,
      };
    } catch {
      return this.fallbackMessage(lead, nodeConfig, tone);
    }
  }

  /**
   * Parse raw AI output into separate subject and body fields.
   *
   * @param rawOutput - The raw text output from Groq
   * @returns Parsed subject and body
   */
  extractSubjectAndBody(rawOutput: string): { subject: string; body: string } {
    const subjectMatch = rawOutput.match(/Subject:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = rawOutput.match(/Body:\s*([\s\S]+)/i);

    return {
      subject: subjectMatch?.[1]?.trim() ?? '',
      body: bodyMatch?.[1]?.trim() ?? rawOutput.trim(),
    };
  }

  /**
   * Generate multiple subject line variants for A/B testing.
   *
   * @param lead       - The target lead
   * @param nodeConfig - Email node configuration
   * @param count      - Number of variants to generate (default 3)
   * @returns Array of subject line strings
   */
  async generateSubjectVariants(
    lead: ILead,
    nodeConfig: EmailNodeConfig,
    count = 3,
  ): Promise<string[]> {
    const context = this.buildContext(lead);
    const prompt = `Given this lead context:
${context}

And this email template guideline:
${nodeConfig.promptTemplate}

Generate exactly ${count} different compelling email subject lines for a cold outreach email.
Number each line (1. 2. 3. etc.). Only output the subject lines, nothing else.`;

    try {
      const raw = await groqService.generate(
        [{ role: 'user', content: prompt }],
        'You are an expert at writing email subject lines that get high open rates.',
      );

      const lines = raw
        .split('\n')
        .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((l) => l.length > 0);

      return lines.slice(0, count);
    } catch {
      // Fallback: return template-based subjects
      return [
        nodeConfig.subjectTemplate.replace(/\{\{name\}\}/g, lead.name),
        `Quick question, ${lead.name}`,
        `${lead.company ?? 'Your team'} + our solution`,
      ].slice(0, count);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  private fallbackMessage(
    lead: ILead,
    nodeConfig: EmailNodeConfig,
    tone: ToneOption,
  ): PersonalizedMessage {
    const subject = (nodeConfig.subjectTemplate ?? 'Quick question, {{name}}')
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{company\}\}/g, lead.company ?? 'your company');

    const body = (nodeConfig.promptTemplate ?? 'Hi {{name}},\n\nI wanted to reach out...')
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{company\}\}/g, lead.company ?? 'your company')
      .replace(/\{\{role\}\}/g, lead.role ?? 'professional')
      .replace(/\{\{industry\}\}/g, lead.industry ?? 'your industry');

    return {
      subject,
      body,
      tone,
      leadId: lead._id.toString(),
      generatedAt: new Date(),
      modelUsed: 'template-fallback',
    };
  }
}

export const messagePersonalizer = new MessagePersonalizer();
