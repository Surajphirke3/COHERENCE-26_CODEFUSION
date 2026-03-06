"use client";

import { motion } from 'framer-motion';

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold font-serif text-white sm:text-4xl tracking-tight">Loved by modern teams</h2>
          <p className="mt-4 text-lg text-gray-400">Join thousands of teams shipping faster.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "This is exactly what we've been looking for. The AI integration alone saves us hours every week on writing product spec.",
              author: "Sarah Jenkins",
              role: "Head of Product",
              company: "TechFlow"
            },
            {
              quote: "Finally, a tool that consolidates project management and documentation without feeling overwhelming. Highly recommended.",
              author: "David Chen",
              role: "Engineering Manager",
              company: "Nova Systems"
            },
            {
              quote: "Our cross-functional teams communicate 10x better now that our tasks and our chat live in the exact same application.",
              author: "Elena Rodriguez",
              role: "Founding Designer",
              company: "Artisan"
            }
          ].map((testimonial, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative backdrop-blur-md cursor-default"
            >
              <div className="absolute top-8 left-6 text-white/10 text-6xl font-serif">"</div>
              <p className="relative text-gray-300 leading-relaxed mb-8 italic z-10 mt-4 text-[15px]">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-inner">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                  <p className="text-xs text-indigo-300">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
