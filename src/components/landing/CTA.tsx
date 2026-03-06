import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#020817]">
      <div className="absolute inset-0 bg-blue-900/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border border-white/10 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight relative z-10">
            Ready to revolutionize <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">your workflow?</span>
          </h2>
          
          <p className="text-xl text-blue-200/70 max-w-2xl mx-auto mb-12 font-light relative z-10">
            Join thousands of developers and teams building the future with Chronos. 
            Start free, scale infinitely when you need to.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <Link 
              href="/signup" 
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="https://github.com" 
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-lg border border-white/10 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Github className="w-5 h-5" />
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
