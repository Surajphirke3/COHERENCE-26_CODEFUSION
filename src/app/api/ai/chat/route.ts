import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { ALL_PROVIDERS } from '@/lib/ai/providers'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, providerId, config } = await req.json()

    if (!messages || !providerId || !config) {
      return NextResponse.json({ error: 'messages, providerId, and config are required' }, { status: 400 })
    }

    const provider = ALL_PROVIDERS.find((p) => p.id === providerId)
    if (!provider) {
      return NextResponse.json({ error: `Unknown provider: ${providerId}` }, { status: 400 })
    }

    // For server-side Groq, use the env key if no client key provided
    const finalConfig = { ...config }
    if (providerId === 'groq' && !finalConfig.apiKey && process.env.GROQ_API_KEY) {
      finalConfig.apiKey = process.env.GROQ_API_KEY
    }

    const reply = await provider.chat(messages, finalConfig)

    return NextResponse.json({ message: reply })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'AI request failed' },
      { status: 500 }
    )
  }
}
