import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'


export default async function LandingPage() {
  // If user is already logged in, skip landing page and go to dashboard
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 bg-[#0A0A0A]">
   
    </div>
  )
}
