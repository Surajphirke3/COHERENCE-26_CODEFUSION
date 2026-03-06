import Link from 'next/link'
import { Box, Twitter, Github, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 font-serif tracking-tight">Workspace</span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              The all-in-one operating system for ambitious modern teams. Work faster, together.
            </p>
            <div className="flex gap-4 text-gray-400">
              <Twitter className="w-5 h-5 hover:text-gray-900 cursor-pointer transition-colors" />
              <Github className="w-5 h-5 hover:text-gray-900 cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-gray-900 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Features</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Pricing</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Changelog</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Documentation</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Blog</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Help Center</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">About</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Careers</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Workspace Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-900">Privacy</Link>
            <Link href="#" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
