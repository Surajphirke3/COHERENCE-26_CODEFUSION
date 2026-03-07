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
  { label: 'Compare', href: '#compare' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track active section on scroll
  useEffect(() => {
    const onScroll = () => {
      const sections = navLinks.map(l => l.href.replace('#', ''))
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveLink(`#${id}`)
          return
        }
      }
      setActiveLink('')
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
      >
        {/* Floating glass container */}
        <div
          className="w-full max-w-5xl rounded-2xl transition-all duration-500"
          style={{
            background: scrolled
              ? 'rgba(var(--l-nav-glass-rgb, 9,14,35), 0.65)'
              : 'rgba(var(--l-nav-glass-rgb, 9,14,35), 0.35)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(var(--l-nav-border-rgb, 255,255,255), 0.08)',
            boxShadow: scrolled
              ? '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-between h-14 px-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/logo.png" alt="Chronos Logo" width={30} height={30} className="rounded-lg" />
              <span className="font-bold text-base tracking-tight" style={{ color: 'var(--l-text)' }}>Chronos</span>
            </Link>

            {/* Desktop Nav — center pills */}
            <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl" style={{ background: 'rgba(var(--l-nav-border-rgb, 255,255,255), 0.04)' }}>
              {navLinks.map((link) => {
                const isActive = activeLink === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-300"
                    style={{ color: isActive ? 'var(--l-text)' : 'var(--l-text-secondary)' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'rgba(var(--l-nav-border-rgb, 255,255,255), 0.08)',
                          border: '1px solid rgba(var(--l-nav-border-rgb, 255,255,255), 0.06)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </a>
                )
              })}
            </div>

            {/* Right — actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-xl transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(var(--l-nav-border-rgb, 255,255,255), 0.06)',
                  border: '1px solid rgba(var(--l-nav-border-rgb, 255,255,255), 0.06)',
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
                className="px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all"
                style={{ color: 'var(--l-text-secondary)' }}
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="group relative px-5 py-2 text-[13px] font-semibold rounded-xl transition-all overflow-hidden"
                style={{
                  background: 'var(--l-accent)',
                  color: 'var(--l-bg)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.2)',
                }}
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </div>

            {/* Mobile — theme + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all cursor-pointer"
                style={{
                  background: 'rgba(var(--l-nav-border-rgb, 255,255,255), 0.06)',
                  color: 'var(--l-text-secondary)',
                }}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl transition-colors cursor-pointer"
                style={{
                  color: 'var(--l-text-secondary)',
                  background: 'rgba(var(--l-nav-border-rgb, 255,255,255), 0.06)',
                }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu — floating dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu card */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed top-20 left-4 right-4 z-50 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(var(--l-nav-glass-rgb, 9,14,35), 0.85)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(var(--l-nav-border-rgb, 255,255,255), 0.1)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
              }}
            >
              <div className="p-5 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: 'var(--l-text-secondary)' }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="pt-3 mt-2 space-y-2" style={{ borderTop: '1px solid rgba(var(--l-nav-border-rgb, 255,255,255), 0.08)' }}>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm"
                    style={{ color: 'var(--l-text-secondary)' }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-center rounded-xl font-semibold text-sm"
                    style={{ background: 'var(--l-accent)', color: 'var(--l-bg)' }}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
