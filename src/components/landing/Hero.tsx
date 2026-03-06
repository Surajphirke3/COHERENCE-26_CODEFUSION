import Link from 'next/link'
import { ArrowRight, Sparkles, Box } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Introducing Workspace 2.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-gray-900 tracking-tight mb-8 leading-tight">
            The operating system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">modern teams</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Replace your fragmented tools with one unified workspace. Tasks, docs, chats, and AI—all seamlessly integrated to help your team move faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/20"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#demo" 
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-all"
            >
              Book a demo
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required. Free for up to 5 members.
          </p>
        </div>

        {/* Dashboard Preview / Mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-xl p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video relative flex items-center justify-center">
              {/* Placeholder for actual dashboard image */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-col gap-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Box className="w-10 h-10 text-indigo-600" />
                </div>
                <p className="text-gray-400 font-medium">Platform Interface Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
