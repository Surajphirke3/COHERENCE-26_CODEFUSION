import { LayoutDashboard, FileText, MessageSquare, Bot } from 'lucide-react'

const features = [
  {
    name: 'Task Management',
    description: 'Keep projects moving forward with kanban boards, lists, and clear ownership.',
    icon: LayoutDashboard,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Team Documentation',
    description: 'Write, collaborate, and organize your most important company knowledge.',
    icon: FileText,
    color: 'bg-green-50 text-green-600',
  },
  {
    name: 'Real-time Chat',
    description: 'Contextual communication where work happens. Stop context switching.',
    icon: MessageSquare,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    name: 'AI Assistant',
    description: 'Draft PRDs, summarize threads, and automatically generate tasks using AI.',
    icon: Bot,
    color: 'bg-orange-50 text-orange-600',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-serif text-gray-900 sm:text-4xl">Everything your team needs</h2>
          <p className="mt-4 text-lg text-gray-600">
            One platform that unites your workflow. Quit juggling between five different tabs and bring your focus back to what matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex flex-col items-start p-6 bg-white border border-gray-100 rounded-2xl h-full shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-3 rounded-lg flex items-center justify-center mb-6 \${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
