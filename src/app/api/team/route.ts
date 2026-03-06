import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/lib/mongodb/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const members = await User.find({ isActive: true })
      .select('-password')
      .sort({ role: 1, name: 1 })

    return NextResponse.json(members)
  } catch (error) {
    console.error('GET /api/team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only admins can update roles
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const { userId, role, title } = await req.json()

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(role && { role }), ...(title && { title }) },
      { new: true }
    ).select('-password')

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json(user)
  } catch (error) {
    console.error('PATCH /api/team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
