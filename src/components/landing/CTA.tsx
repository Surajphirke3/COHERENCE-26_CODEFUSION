"use client";

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function CTA() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden border-t border-white/5">
      {/* Absolute dark glowing core */}
      <div className="absolute inset-0 bg-indigo-900/10"></div>
      
      {/* Decorative blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-600/30 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/[0.03] border border-white/10 p-12 md:p-20 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Inner subtle noise or grid could go here */}
          
          <h2 className="text-4xl font-bold font-serif text-white sm:text-5xl mb-6 tracking-tight drop-shadow-md">
            Ready to supercharge your team?
          </h2>
          <p className="mt-4 text-xl text-indigo-200/80 max-w-2xl mx-auto mb-10">
            Join thousands of startups and agile teams building the next generation of products with Workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(79,70,229,0.4)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-colors backdrop-blur-md"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
