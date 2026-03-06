import { Navbar, Hero, Features, Testimonials, CTA, Footer } from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30 font-sans">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
