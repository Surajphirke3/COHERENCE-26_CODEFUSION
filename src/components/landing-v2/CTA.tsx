'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[180px] -z-10" />
      <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[140px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 p-12 md:p-20 text-center backdrop-blur-sm overflow-hidden"
        >
          {/* Floating Sparkles */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-12 left-12 text-indigo-400/30"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [360, 180, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-12 right-12 text-violet-400/30"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 max-w-3xl mx-auto">
            Ready to supercharge your team?
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Join thousands of startups building the next generation of products with Chronos. Start free, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link
              href="#"
              className="w-full sm:w-auto inline-flex justify-center items-center px-10 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
