import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-300 mb-8 max-w-fit mx-auto cursor-pointer hover:bg-white/10 transition-colors">
          <Sparkles className="w-4 h-4" />
          <span>Introducing Chronos AI V2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          The ultimate platform for
          <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
            {" "}Limitless Growth
          </span>
        </h1>
        
        <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Supercharge your workflow with our next-generation AI tools. 
          Build, scale, and optimize your business faster than ever before.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            Start Building Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#demo"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 text-white font-semibold text-lg border border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto justify-center"
          >
            Watch Demo
          </Link>
        </div>
        
        {/* Abstract mock UI */}
        <div className="mt-16 sm:mt-24 relative max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl shadow-2xl p-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-xl object-cover w-full h-auto border border-white/5 opacity-80 mix-blend-screen"
            />
            {/* Overlay gradient to fade bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
