<<<<<<< HEAD
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/campaigns");
  }
=======
import { Navbar, Hero, Features, Testimonials, CTA, Footer } from "@/components/landing";
>>>>>>> 4d3e013db0d49b8fdf448fb84055536d98b63a47

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <main className="w-full max-w-4xl rounded-2xl border border-border bg-card p-10 md:p-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-3 py-1 text-xs font-medium text-accent">
            OutreachAI
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            AI-powered outbound with workflow automation
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Launch campaigns, monitor deliverability, and optimize performance from a single workspace.
          </p>
        </div>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            Start Free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-white/5"
          >
            Sign In
          </Link>
        </div>
=======
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30 font-sans">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
>>>>>>> 4d3e013db0d49b8fdf448fb84055536d98b63a47
      </main>
      <Footer />
    </div>
  );
}
