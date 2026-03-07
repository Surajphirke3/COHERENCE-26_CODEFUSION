import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { LandingPageClient } from '@/components/landing-v2/LandingPageClient'

export default async function LandingPage() {
  // If user is already logged in, skip landing page and go to dashboard
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }

  return <LandingPageClient />
}
