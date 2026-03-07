import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import {
  Navbar,
  Hero,
  Features,
  Workflow,
  Solutions,
  Stats,
  Pricing,
  Testimonials,
  CTA,
  Footer,
} from '@/components/landing-v2'

export default async function LandingPage() {
  // If user is already logged in, skip landing page and go to dashboard
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <Stats />
        <Features />
        <Workflow />
        <Solutions />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}
