'use client'

import { Sun, Moon, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LandingThemeProvider, useTheme } from '@/components/landing-v2/ThemeContext'
import { AuthBackground } from '@/components/auth/AuthBackground'

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      className={theme === 'light' ? 'landing-light' : 'landing-dark'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--l-bg)',
        transition: 'background-color 0.5s ease, color 0.5s ease',
      }}
    >
      {/* Interactive workflow background */}
      <AuthBackground />

      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-4 left-4 p-2 px-3 rounded-xl transition-all duration-300 z-50 flex items-center gap-1.5 text-sm no-underline"
        style={{
          background: 'var(--l-bg-card)',
          border: '1px solid var(--l-border)',
          color: 'var(--l-text-secondary)',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Home
      </Link>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-xl transition-all duration-300 cursor-pointer z-50"
        style={{
          background: 'var(--l-bg-card)',
          border: '1px solid var(--l-border)',
          color: 'var(--l-text-secondary)',
        }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.div>
      </button>

      {/* Form container - elevated above background */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingThemeProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </LandingThemeProvider>
  )
}
