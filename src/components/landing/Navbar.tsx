"use client";

import Link from 'next/link'
import { ArrowRight, Box } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Navbar() {
  const { scrollY } = useScroll()
  const backgroundColor = useTransform(scrollY, [0, 50], ["rgba(10, 10, 10, 0)", "rgba(10, 10, 10, 0.8)"])
  const backdropBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"])
  const borderColor = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"])

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur, borderBottomColor: borderColor }}
      className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-800 to-indigo-500"></div>
              <Box className="w-5 h-5 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-bold text-xl text-white font-serif tracking-tight">Workspace</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Customers
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-full transition-colors shadow-sm backdrop-blur-md"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
