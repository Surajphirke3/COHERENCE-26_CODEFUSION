import { connectDB } from '@/lib/mongodb/client'
import { UserSettings } from '@/lib/mongodb/models/UserSettings'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    let settings = await UserSettings.findOne({ userId: session.user.id }).lean()
    if (!settings) {
      // Return defaults
      settings = {
        emailProvider: 'gmail',
        emailAddress: session.user.email || '',
        emailAppPassword: '',
        emailFromName: session.user.name || '',
        aiProvider: 'groq',
        aiApiKey: '',
        aiModel: 'llama-3.3-70b-versatile',
        aiBaseUrl: '',
      }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      emailProvider, emailAddress, emailAppPassword, emailFromName,
      aiProvider, aiApiKey, aiModel, aiBaseUrl,
    } = body

    await connectDB()

    const settings = await UserSettings.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          ...(emailProvider !== undefined && { emailProvider }),
          ...(emailAddress !== undefined && { emailAddress }),
          ...(emailAppPassword !== undefined && { emailAppPassword }),
          ...(emailFromName !== undefined && { emailFromName }),
          ...(aiProvider !== undefined && { aiProvider }),
          ...(aiApiKey !== undefined && { aiApiKey }),
          ...(aiModel !== undefined && { aiModel }),
          ...(aiBaseUrl !== undefined && { aiBaseUrl }),
        },
      },
      { upsert: true, new: true }
    ).lean()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error saving user settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
