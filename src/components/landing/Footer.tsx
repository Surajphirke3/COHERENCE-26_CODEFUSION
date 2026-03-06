import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Changelog", href: "/changelog" },
        { name: "Documentation", href: "/docs" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
      ]
    }
  ];

  return (
    <footer className="bg-[#020817] pt-20 pb-10 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6 inline-block">
              Chronos
            </Link>
            <p className="text-gray-400 mb-8 max-w-sm font-light leading-relaxed">
              Empowering next-generation teams with intelligent tools, unmatched performance, and seamless integrations.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white/10 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@example.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-white/10 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, lidx) => (
                  <li key={lidx}>
                    <Link href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-light">
            © {currentYear} Chronos Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-light">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
