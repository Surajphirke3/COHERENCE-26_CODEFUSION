import { Zap, Shield, Rocket, Clock, Database, Code2 } from "lucide-react";

const features = [
  {
    name: "Lightning Fast",
    description: "Built on modern infrastructure, our globally distributed network ensures ultra-low latency.",
    icon: Zap,
    color: "text-yellow-400 font-bold",
    bg: "bg-yellow-400/10",
  },
  {
    name: "Bank-Grade Security",
    description: "Enterprise encryption standards. Your data is protected by the most advanced protocols.",
    icon: Shield,
    color: "text-emerald-400 font-bold",
    bg: "bg-emerald-400/10",
  },
  {
    name: "Instant Scaling",
    description: "Our elastic compute automatically scales resources up or down to handle traffic spikes.",
    icon: Rocket,
    color: "text-blue-400 font-bold",
    bg: "bg-blue-400/10",
  },
  {
    name: "24/7 Monitored",
    description: "Real-time alerts and historical data keep you informed about your application's health.",
    icon: Clock,
    color: "text-purple-400 font-bold",
    bg: "bg-purple-400/10",
  },
  {
    name: "Global Database",
    description: "Data distributed to the edge for single-digit millisecond response times globally.",
    icon: Database,
    color: "text-pink-400 font-bold",
    bg: "bg-pink-400/10",
  },
  {
    name: "Developer First",
    description: "Integrate seamlessly with our extensive API and robust collection of SDKs.",
    icon: Code2,
    color: "text-indigo-400 font-bold",
    bg: "bg-indigo-400/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-[#020817] relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Everything you need
            <br className="hidden sm:block" />
            <span className="text-gray-400"> to build modern apps</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="relative group bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-all hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 \${feature.bg} shadow-inner`}>
                <feature.icon className={`w-7 h-7 \${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.name}
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
