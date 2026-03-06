import { streamGroq } from '@/lib/ai/groq'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a senior product manager at a startup.
Given product details, write a complete PRD in markdown format.
Include these sections: Overview, Goals, Target Users, Core Features (MVP scope), User Stories, Technical Considerations, Success Metrics, Timeline.
Be specific and actionable. No fluff. Write in clear, professional prose.`

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productName, goals, users, constraints } = await req.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const userMessage = [
      `Product: ${productName}`,
      goals ? `Goals: ${goals}` : '',
      users ? `Target Users: ${users}` : '',
      constraints ? `Constraints: ${constraints}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const stream = await streamGroq(SYSTEM_PROMPT, userMessage)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('AI prd-writer error:', error)
    return NextResponse.json({ error: 'PRD generation failed. Please try again.' }, { status: 500 })
  }
}
