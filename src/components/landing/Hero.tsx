"use client";

import Link from 'next/link'
import { ArrowRight, Sparkles, Box, CheckCircle2, MessageSquare, Terminal } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Hero() {
  // 3D Tilt Effect Setup
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as any

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0A0A0A]">
      
      {/* 3D Animated Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Glowing Orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3, delay: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[150px] -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>Workspace 2.0 is here</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-white tracking-tight mb-8 leading-[1.1]">
            A new dimension for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">
              startup teams
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p variants={fadeIn} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Replace your fragmented tools with one unified universe. Tasks, docs, chats, and intelligent AI natively integrated in a beautiful 3D workspace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              href="/register" 
              className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-full transition-all hover:bg-indigo-500 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start building free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </Link>
            <Link 
              href="#demo" 
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              Take a tour
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <motion.div 
          className="mt-24 relative mx-auto max-w-5xl [perspective:2000px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="w-full relative h-[400px] md:h-[600px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-2xl flex flex-col cursor-pointer"
          >
            {/* Absolute Glow behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-2xl opacity-20 -z-10 group-hover:opacity-40 transition duration-500"></div>

            {/* Dummy Top Bar */}
            <div className="w-full h-12 border-b border-white/5 flex items-center justify-between px-4" style={{ transform: "translateZ(30px)" }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="w-48 h-6 bg-white/5 rounded-full"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex mt-4 gap-4" style={{ transform: "translateZ(50px)" }}>
              {/* Sidebar Dummy */}
              <div className="w-48 h-full bg-white/5 rounded-xl hidden md:flex flex-col gap-3 p-3">
                <div className="w-full h-8 bg-white/10 rounded-md"></div>
                <div className="w-full h-8 bg-white/5 rounded-md"></div>
                <div className="w-full h-8 bg-white/5 rounded-md"></div>
              </div>
              
              {/* Main Content Dummy */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4 h-32">
                  <div className="flex-1 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/10 rounded-xl p-4 flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
                    <Box className="w-6 h-6 text-indigo-400" />
                    <div className="w-24 h-4 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between" style={{ transform: "translateZ(10px)" }}>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div className="w-32 h-4 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-6 relative overflow-hidden" style={{ transform: "translateZ(40px)" }}>
                  {/* Fake Code / Activity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="w-64 h-3 bg-white/10 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="w-48 h-3 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
