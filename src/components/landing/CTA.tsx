import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600"></div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <h2 className="text-3xl font-bold font-serif text-white sm:text-5xl mb-6">
          Ready to supercharge your team?
        </h2>
        <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
          Join thousands of startups and agile teams building the next generation of products with Workspace.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register" 
            className="inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-indigo-600 bg-white hover:bg-indigo-50 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-xl"
          >
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/contact" 
            className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white border border-indigo-400 hover:bg-indigo-700/50 rounded-full transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  )
}
