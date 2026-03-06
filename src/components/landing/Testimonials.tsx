export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-serif text-gray-900 sm:text-4xl">Loved by modern teams</h2>
          <p className="mt-4 text-lg text-gray-600">Don't just take our word for it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "This is exactly what we've been looking for. The AI integration alone saves us hours every week on writing product spec.",
              author: "Sarah Jenkins",
              role: "Head of Product",
              company: "TechFlow"
            },
            {
              quote: "Finally, a tool that consolidates project management and documentation without feeling overwhelming. The UI is gorgeous.",
              author: "David Chen",
              role: "Engineering Manager",
              company: "Nova Systems"
            },
            {
              quote: "Our cross-functional teams communicate 10x better now that our tasks and our chat live in the exact same application.",
              author: "Elena Rodriguez",
              role: "Founding Designer",
              company: "Artisan"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
              <div className="absolute top-8 left-6 text-gray-200 text-5xl font-serif">"</div>
              <p className="relative text-gray-700 leading-relaxed mb-8 italic z-10">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
