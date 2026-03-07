'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from './ThemeContext'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#workflow' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Testimonials', href: '#testimonials' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500`}
      style={{
        background: scrolled ? 'var(--l-nav-scrolled)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--l-border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.png" alt="Chronos Logo" width={36} height={36} className="rounded-xl" />
            <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--l-text)' }}>Chronos</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm rounded-lg transition-all duration-200"
                style={{ color: 'var(--l-text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--l-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--l-text-secondary)')}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons + Theme Toggle */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                background: 'var(--l-badge-bg)',
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
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </button>

            <Link
              href="/login"
              className="px-4 py-2 text-sm transition-colors"
              style={{ color: 'var(--l-text-secondary)' }}
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="group relative px-5 py-2.5 text-sm font-semibold rounded-full transition-all overflow-hidden shadow-lg"
              style={{
                background: 'var(--l-accent)',
                color: 'var(--l-bg)',
              }}
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all cursor-pointer"
              style={{
                background: 'var(--l-badge-bg)',
                border: '1px solid var(--l-border)',
                color: 'var(--l-text-secondary)',
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 transition-colors"
              style={{ color: 'var(--l-text-secondary)' }}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden backdrop-blur-2xl"
            style={{
              background: 'var(--l-mobile-menu)',
              borderBottom: '1px solid var(--l-border)',
            }}
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg transition-colors"
                  style={{ color: 'var(--l-text-secondary)' }}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--l-border)' }}>
                <Link href="/login" className="block px-4 py-3 rounded-lg" style={{ color: 'var(--l-text-secondary)' }}>
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-3 text-center rounded-xl font-semibold"
                  style={{ background: 'var(--l-accent)', color: 'var(--l-bg)' }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
