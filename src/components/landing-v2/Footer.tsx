import Link from 'next/link'
import { Twitter, Github, Linkedin } from 'lucide-react'
import Image from 'next/image'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Integrations', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="pt-16 pb-8" style={{ background: 'var(--l-footer-bg)', borderTop: '1px solid var(--l-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image src="/logo.png" alt="Chronos Logo" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-lg" style={{ color: 'var(--l-text)' }}>Chronos</span>
            </Link>
            <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--l-text-tertiary)' }}>
              The all-in-one operating system for ambitious modern teams. Work faster, together.
            </p>
            <div className="flex gap-4" style={{ color: 'var(--l-text-muted)' }}>
              <Twitter className="w-5 h-5 hover:opacity-80 cursor-pointer transition-opacity" />
              <Github className="w-5 h-5 hover:opacity-80 cursor-pointer transition-opacity" />
              <Linkedin className="w-5 h-5 hover:opacity-80 cursor-pointer transition-opacity" />
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--l-text)' }}>{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors text-sm" style={{ color: 'var(--l-text-tertiary)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid var(--l-border)' }}>
          <p className="text-sm" style={{ color: 'var(--l-text-muted)' }}>
            © {new Date().getFullYear()} Chronos Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--l-text-tertiary)' }}>
            <Link href="#" className="hover:opacity-80 transition-opacity">Privacy</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
