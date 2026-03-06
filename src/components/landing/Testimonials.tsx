export function Testimonials() {
  const testimonials = [
    {
      content: "Chronos completely changed how we handle deployment and scaling. It’s seamlessly integrated into our daily workflow and saves our team hundreds of hours.",
      author: "Sarah Jenkins",
      title: "CTO, TechNova",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
    },
    {
      content: "The level of control and the speed at which we can iterate now is mind-blowing. Support is fantastic and the product just works.",
      author: "Michael Chen",
      title: "Lead Engineer, DevCorp",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
    },
    {
      content: "Migrating to Chronos was the best decision for our infrastructure. The latency dropped immensely and our user satisfaction went through the roof.",
      author: "Elena Rodriguez",
      title: "VP Engineering, CloudScale",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#020817] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-500 mb-16">
            Loved by leading teams
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {testimonials.map((test, index) => (
              <div 
                key={index}
                className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 relative text-left"
              >
                <div className="text-blue-500 mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed font-light">
                  "{test.content}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <img 
                    src={test.image} 
                    alt={test.author} 
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                  <div>
                    <h4 className="text-white font-medium">{test.author}</h4>
                    <span className="text-gray-500 text-sm">{test.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
