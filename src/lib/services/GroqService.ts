// src/lib/services/GroqService.ts
import Groq from 'groq-sdk';
import type { ILead } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Error                                                              */
/* ------------------------------------------------------------------ */

export class GroqServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GroqServiceError';
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PersonalizedOutput {
  subject: string;
  body: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MODEL = 'llama-3.1-8b-instant';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class GroqService {
  private client: Groq | null = null;

  /** Lazy-initialise the Groq client. */
  private getClient(): Groq {
    if (!this.client) {
      this.client = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' });
    }
    return this.client;
  }

  /**
   * Generate a streaming response from Groq.
   *
   * @param messages     - Conversation messages
   * @param systemPrompt - Optional system-level instruction
   * @returns An async iterable of text chunks
   */
  async *generateStream(
    messages: GroqMessage[],
    systemPrompt?: string,
  ): AsyncIterable<string> {
    const allMessages: GroqMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const stream = await this.getClient().chat.completions.create({
        model: MODEL,
        messages: allMessages,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
      }
    } catch (err: unknown) {
      if (this.isRateLimited(err)) {
        // Retry once after a short pause
        await this.sleep(1000);
        const retryStream = await this.getClient().chat.completions.create({
          model: MODEL,
          messages: allMessages,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: DEFAULT_MAX_TOKENS,
          stream: true,
        });
        for await (const chunk of retryStream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) yield delta;
        }
      } else {
        throw new GroqServiceError('Streaming generation failed', err);
      }
    }
  }

  /**
   * Generate a complete (non-streaming) response from Groq.
   *
   * @param messages     - Conversation messages
   * @param systemPrompt - Optional system-level instruction
   * @param maxTokens    - Override for max tokens
   * @returns The full generated text
   */
  async generate(
    messages: GroqMessage[],
    systemPrompt?: string,
    maxTokens?: number,
  ): Promise<string> {
    const allMessages: GroqMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await this.getClient().chat.completions.create({
        model: MODEL,
        messages: allMessages,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
      });

      return response.choices[0]?.message?.content?.trim() ?? '';
    } catch (err: unknown) {
      if (this.isRateLimited(err)) {
        await this.sleep(1000);
        const retry = await this.getClient().chat.completions.create({
          model: MODEL,
          messages: allMessages,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
        });
        return retry.choices[0]?.message?.content?.trim() ?? '';
      }
      throw new GroqServiceError('Generation failed', err);
    }
  }

  /**
   * Convenience method: personalise an outreach message for a given lead.
   *
   * @param lead           - The lead to personalise for
   * @param promptTemplate - Template string containing `{{name}}`, `{{company}}` etc.
   * @param tone           - Desired tone (default 'formal')
   * @returns An object with `subject` and `body`
   */
  async personalizeMessage(
    lead: ILead,
    promptTemplate: string,
    tone?: string,
  ): Promise<PersonalizedOutput> {
    const filledTemplate = promptTemplate
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{company\}\}/g, lead.company ?? 'your company')
      .replace(/\{\{role\}\}/g, lead.role ?? 'professional')
      .replace(/\{\{industry\}\}/g, lead.industry ?? 'your industry');

    const systemPrompt = `You are an expert sales copywriter. Write a personalised cold outreach email.
Tone: ${tone ?? 'formal'}.
Respond ONLY with:
Subject: <subject line>
Body: <email body>`;

    const raw = await this.generate(
      [{ role: 'user', content: filledTemplate }],
      systemPrompt,
    );

    return this.parseSubjectBody(raw);
  }

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  private parseSubjectBody(raw: string): PersonalizedOutput {
    const subjectMatch = raw.match(/Subject:\s*(.+)/i);
    const bodyMatch = raw.match(/Body:\s*([\s\S]+)/i);
    return {
      subject: subjectMatch?.[1]?.trim() ?? 'Quick question',
      body: bodyMatch?.[1]?.trim() ?? raw.trim(),
    };
  }

  private isRateLimited(err: unknown): boolean {
    if (err && typeof err === 'object' && 'status' in err) {
      return (err as { status: number }).status === 429;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export const groqService = new GroqService();
