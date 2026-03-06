import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#020817]/80 backdrop-blur-md border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Chronos
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
