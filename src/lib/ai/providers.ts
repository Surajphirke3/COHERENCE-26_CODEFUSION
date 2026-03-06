/**
 * Unified AI Provider Abstraction
 * 
 * All providers implement the same interface so they are interchangeable.
 * Config is stored in localStorage via Zustand.
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIProviderConfig {
  id: string
  name: string
  apiKey: string
  baseUrl: string
  model: string
  enabled: boolean
}

export interface AIProvider {
  id: string
  name: string
  description: string
  models: string[]
  defaultModel: string
  requiresApiKey: boolean
  defaultBaseUrl: string
  chat: (messages: AIMessage[], config: AIProviderConfig) => Promise<string>
  stream: (messages: AIMessage[], config: AIProviderConfig) => Promise<ReadableStream<string>>
}

// ── Helper: fetch with timeout ──
async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`${res.status} ${res.statusText}: ${body.slice(0, 200)}`)
    }
    return res
  } finally {
    clearTimeout(timer)
  }
}

// ── Helper: OpenAI-compatible streaming ──
async function openAICompatibleStream(
  url: string,
  headers: Record<string, string>,
  body: object
): Promise<ReadableStream<string>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ ...body, stream: true }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`${res.status}: ${errText.slice(0, 200)}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream<string>({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) { controller.close(); return }
      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n').filter((l) => l.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') { controller.close(); return }
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) controller.enqueue(delta)
        } catch { /* skip malformed */ }
      }
    },
  })
}

// ── Helper: OpenAI-compatible chat (non-streaming) ──
async function openAICompatibleChat(
  url: string,
  headers: Record<string, string>,
  body: object
): Promise<string> {
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ═══════════════════════════════════════════════════════════
// Provider Implementations
// ═══════════════════════════════════════════════════════════

export const groqProvider: AIProvider = {
  id: 'groq',
  name: 'Groq',
  description: 'Ultra-fast inference — free tier available',
  models: ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  defaultModel: 'llama-3.3-70b-versatile',
  requiresApiKey: true,
  defaultBaseUrl: 'https://api.groq.com/openai/v1',
  chat: (messages, config) =>
    openAICompatibleChat(
      `${config.baseUrl}/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
  stream: (messages, config) =>
    openAICompatibleStream(
      `${config.baseUrl}/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
}

export const ollamaProvider: AIProvider = {
  id: 'ollama',
  name: 'Ollama',
  description: 'Local models — no API key needed',
  models: ['llama3', 'mistral', 'phi3', 'gemma2', 'qwen2'],
  defaultModel: 'llama3',
  requiresApiKey: false,
  defaultBaseUrl: 'http://localhost:11434',
  chat: async (messages, config) => {
    const res = await fetchWithTimeout(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages, stream: false }),
    })
    const data = await res.json()
    return data.message?.content ?? ''
  },
  stream: async (messages, config) => {
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages, stream: true }),
    })
    if (!res.ok) throw new Error(`Ollama: ${res.status}`)
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    return new ReadableStream<string>({
      async pull(controller) {
        const { done, value } = await reader.read()
        if (done) { controller.close(); return }
        const text = decoder.decode(value, { stream: true })
        for (const line of text.split('\n').filter(Boolean)) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.message?.content) controller.enqueue(parsed.message.content)
            if (parsed.done) controller.close()
          } catch { /* skip */ }
        }
      },
    })
  },
}

export const sambaNovaProvider: AIProvider = {
  id: 'sambanova',
  name: 'SambaNova',
  description: 'Free cloud inference for Llama models',
  models: ['Meta-Llama-3.1-8B-Instruct', 'Meta-Llama-3.1-70B-Instruct'],
  defaultModel: 'Meta-Llama-3.1-8B-Instruct',
  requiresApiKey: true,
  defaultBaseUrl: 'https://api.sambanova.ai/v1',
  chat: (messages, config) =>
    openAICompatibleChat(
      `${config.baseUrl}/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
  stream: (messages, config) =>
    openAICompatibleStream(
      `${config.baseUrl}/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
}

export const openRouterProvider: AIProvider = {
  id: 'openrouter',
  name: 'OpenRouter',
  description: 'Multi-model gateway with free models',
  models: [
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-7b-it:free',
    'meta-llama/llama-3-8b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
  ],
  defaultModel: 'mistralai/mistral-7b-instruct:free',
  requiresApiKey: true,
  defaultBaseUrl: 'https://openrouter.ai/api/v1',
  chat: (messages, config) =>
    openAICompatibleChat(
      `${config.baseUrl}/chat/completions`,
      {
        Authorization: `Bearer ${config.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'OutreachAI',
      },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
  stream: (messages, config) =>
    openAICompatibleStream(
      `${config.baseUrl}/chat/completions`,
      {
        Authorization: `Bearer ${config.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'OutreachAI',
      },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
}

export const huggingFaceProvider: AIProvider = {
  id: 'huggingface',
  name: 'Hugging Face',
  description: 'Inference API free tier',
  models: [
    'mistralai/Mistral-7B-Instruct-v0.3',
    'google/gemma-2-2b-it',
    'microsoft/Phi-3-mini-4k-instruct',
  ],
  defaultModel: 'mistralai/Mistral-7B-Instruct-v0.3',
  requiresApiKey: true,
  defaultBaseUrl: 'https://api-inference.huggingface.co/models',
  chat: async (messages, config) => {
    const prompt = messages
      .map((m) => (m.role === 'system' ? `[INST] ${m.content} [/INST]` : m.role === 'user' ? `[INST] ${m.content} [/INST]` : m.content))
      .join('\n')
    const res = await fetchWithTimeout(`${config.baseUrl}/${config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 2048, temperature: 0.7, return_full_text: false },
      }),
    })
    const data = await res.json()
    if (Array.isArray(data)) return data[0]?.generated_text ?? ''
    return data.generated_text ?? data.error ?? ''
  },
  stream: async (messages, config) => {
    // HF inference API doesn't support true SSE streaming for all models
    // Simulate streaming by returning the full response as a stream
    const result = await huggingFaceProvider.chat(messages, config)
    const words = result.split(' ')
    let index = 0
    return new ReadableStream<string>({
      pull(controller) {
        if (index >= words.length) { controller.close(); return }
        const chunk = (index === 0 ? '' : ' ') + words[index]
        controller.enqueue(chunk)
        index++
      },
    })
  },
}

// ── BYOK (Custom Provider) — uses OpenAI-compatible API format ──
export const byokProvider: AIProvider = {
  id: 'byok',
  name: 'Custom (BYOK)',
  description: 'Bring Your Own Key — any OpenAI-compatible API',
  models: [],
  defaultModel: '',
  requiresApiKey: true,
  defaultBaseUrl: '',
  chat: (messages, config) =>
    openAICompatibleChat(
      `${config.baseUrl}/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
  stream: (messages, config) =>
    openAICompatibleStream(
      `${config.baseUrl}/chat/completions`,
      { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, messages, temperature: 0.7, max_tokens: 2048 }
    ),
}

// ── All built-in providers ──
export const ALL_PROVIDERS: AIProvider[] = [
  groqProvider,
  ollamaProvider,
  sambaNovaProvider,
  openRouterProvider,
  huggingFaceProvider,
  byokProvider,
]

export function getProvider(id: string): AIProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id)
}
