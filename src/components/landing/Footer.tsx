import Link from 'next/link'
import { Box, Twitter, Github, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-8 h-8 rounded-lg bg-indigo-600/80 flex items-center justify-center overflow-hidden border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-800 to-indigo-500 opacity-50"></div>
                <Box className="w-5 h-5 text-white relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-xl text-white font-serif tracking-tight">Workspace</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
              The all-in-one operating system for ambitious modern teams. Work faster, together in a beautiful universe.
            </p>
            <div className="flex gap-4 text-gray-500">
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Github className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Pricing</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Changelog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">About</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Workspace Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
