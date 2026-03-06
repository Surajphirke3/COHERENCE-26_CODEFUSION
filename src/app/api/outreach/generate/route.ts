import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { generateMessage } from '@/lib/ai/groqPersonalizer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lead, promptTemplate, tone, channel, length } = await req.json()

    if (!lead || !promptTemplate) {
      return NextResponse.json(
        { error: 'lead and promptTemplate are required' },
        { status: 400 }
      )
    }

    const message = await generateMessage({ lead, promptTemplate, tone, channel, length })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
  }
}
