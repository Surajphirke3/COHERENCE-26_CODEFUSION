'use client'

import { LandingThemeProvider, useTheme } from './ThemeContext'
import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { Features } from './Features'
import { Workflow } from './Workflow'
import { Solutions } from './Solutions'
import { Stats } from './Stats'
import { Pricing } from './Pricing'
import { Testimonials } from './Testimonials'
import { CTA } from './CTA'
import { Footer } from './Footer'

function LandingShell() {
  const { theme } = useTheme()

  return (
    <div
      className={`landing-page ${theme === 'light' ? 'landing-light' : 'landing-dark'}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: 'background-color 0.5s ease, color 0.5s ease',
      }}
    >
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Hero />
        <Stats />
        <Features />
        <Workflow />
        <Solutions />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export function LandingPageClient() {
  return (
    <LandingThemeProvider>
      <LandingShell />
    </LandingThemeProvider>
  )
}
