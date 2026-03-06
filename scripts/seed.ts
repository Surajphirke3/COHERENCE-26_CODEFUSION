import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env', override: true })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Minimal schemas for seeding
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  title: String,
  role: { type: String, default: 'member' },
})

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  color: String,
  status: String,
  dueDate: Date,
  ownerId: mongoose.Schema.Types.ObjectId,
  members: [mongoose.Schema.Types.ObjectId],
})

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  projectId: mongoose.Schema.Types.ObjectId,
  assigneeId: mongoose.Schema.Types.ObjectId,
  dueDate: Date,
  position: Number,
})

const leadSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  company: String,
  title: String,
  linkedinUrl: String,
  phone: String,
  status: { type: String, default: 'new' },
  ownerId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true })

const workflowSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  nodes: [mongoose.Schema.Types.Mixed],
  edges: [mongoose.Schema.Types.Mixed],
  status: { type: String, default: 'draft' },
  config: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

const executionSchema = new mongoose.Schema({
  workflowId: mongoose.Schema.Types.ObjectId,
  leadId: mongoose.Schema.Types.ObjectId,
  ownerId: mongoose.Schema.Types.ObjectId,
  currentNodeId: String,
  status: { type: String, default: 'pending' },
  stepHistory: [mongoose.Schema.Types.Mixed],
  nextExecutionAt: Date,
  errorMessage: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema)
const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema)
const WorkflowExecution = mongoose.models.WorkflowExecution || mongoose.model('WorkflowExecution', executionSchema)

async function seed() {
  try {
    console.log('🌱 Connecting to database...')
    await mongoose.connect(MONGODB_URI!)

    console.log('🧹 Clearing existing data...')
    await User.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})
    await Lead.deleteMany({})
    await Workflow.deleteMany({})
    await WorkflowExecution.deleteMany({})

    console.log('👥 Creating users...')
    const passwordHash = await bcrypt.hash('password123', 10)
    
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@startup.com', password: passwordHash, title: 'Founder & CEO', role: 'admin' },
      { name: 'Sarah Chen', email: 'sarah@startup.com', password: passwordHash, title: 'Lead Designer', role: 'member' },
      { name: 'Alex Patel', email: 'alex@startup.com', password: passwordHash, title: 'Senior Engineer', role: 'member' },
      { name: 'Maria Garcia', email: 'maria@startup.com', password: passwordHash, title: 'Product Manager', role: 'member' },
    ])

    const admin = users[0]
    const sarah = users[1]
    const alex = users[2]
    const maria = users[3]

    console.log('🚀 Creating projects...')
    const today = new Date()
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
    const nextMonth = new Date(today); nextMonth.setMonth(today.getMonth() + 1)

    const projects = await Project.insertMany([
      {
        name: 'Website Redesign',
        description: 'Overhaul the marketing site with the new branding.',
        color: '#6366f1', // Primary
        status: 'active',
        dueDate: nextMonth,
        ownerId: admin._id,
        members: [admin._id, sarah._id, alex._id],
      },
      {
        name: 'Mobile App V2',
        description: 'Build the new React Native app with offline support.',
        color: '#22c55e', // Success
        status: 'active',
        dueDate: nextWeek,
        ownerId: maria._id,
        members: [admin._id, maria._id, alex._id],
      },
      {
        name: 'Q3 Marketing Campaign',
        description: 'Assets and planning for the upcoming product launch.',
        color: '#f59e0b', // Warning
        status: 'paused',
        dueDate: today,
        ownerId: sarah._id,
        members: [sarah._id, maria._id],
      },
    ])

    console.log('📝 Creating tasks...')
    const webProject = projects[0]
    const appProject = projects[1]

    await Task.insertMany([
      // Web Project Tasks
      { title: 'Design home page mockup', description: 'Create high-fidelity mockups for the new homepage.', status: 'review', priority: 'high', projectId: webProject._id, assigneeId: sarah._id, position: 0 },
      { title: 'Update brand guidelines', description: 'Document the new color palette and typography.', status: 'done', priority: 'medium', projectId: webProject._id, assigneeId: sarah._id, position: 1 },
      { title: 'Implement hero section', description: 'Build the animated hero section with Framer Motion.', status: 'in_progress', priority: 'high', projectId: webProject._id, assigneeId: alex._id, position: 2 },
      { title: 'Setup Next.js boilerplate', description: 'Initialize the app directory with Tailwind v4.', status: 'done', priority: 'high', projectId: webProject._id, assigneeId: alex._id, position: 3 },
      { title: 'Write copy for about page', description: 'Draft the company story and team bios.', status: 'todo', priority: 'low', projectId: webProject._id, assigneeId: maria._id, position: 4 },
      
      // App Project Tasks
      { title: 'Research offline-first dbs', description: 'Evaluate WatermelonDB vs Realm.', status: 'done', priority: 'high', projectId: appProject._id, assigneeId: alex._id, position: 0 },
      { title: 'Design new navigation', description: 'Bottom tab bar and modal sheet designs.', status: 'todo', priority: 'medium', projectId: appProject._id, assigneeId: sarah._id, position: 1 },
      { title: 'Set up Redux Toolkit', description: 'Configure state management for offline sync.', status: 'in_progress', priority: 'high', projectId: appProject._id, assigneeId: alex._id, position: 2 },
    ])

    // ── Outreach Demo Data ──
    console.log('📧 Creating outreach demo data...')

    const leads = await Lead.insertMany([
      { firstName: 'Priya', lastName: 'Sharma', email: 'priya@techcorp.io', company: 'TechCorp', title: 'CEO', status: 'new', ownerId: admin._id },
      { firstName: 'James', lastName: 'Wilson', email: 'james@scaleup.com', company: 'ScaleUp Inc', title: 'VP Sales', status: 'new', ownerId: admin._id },
      { firstName: 'Aisha', lastName: 'Khan', email: 'aisha@growthlab.co', company: 'GrowthLab', title: 'Head of Partnerships', status: 'in_sequence', ownerId: admin._id },
      { firstName: 'David', lastName: 'Chen', email: 'david@nextera.ai', company: 'NextEra AI', title: 'CTO', status: 'in_sequence', ownerId: admin._id },
      { firstName: 'Elena', lastName: 'Rodriguez', email: 'elena@brightpath.com', company: 'BrightPath', title: 'Founder', status: 'replied', ownerId: admin._id },
      { firstName: 'Tom', lastName: 'Harris', email: 'tom@cloudnine.dev', company: 'CloudNine', title: 'Engineering Lead', status: 'converted', ownerId: admin._id },
      { firstName: 'Sophie', lastName: 'Martin', email: 'sophie@datawise.io', company: 'DataWise', title: 'COO', status: 'opted_out', ownerId: admin._id },
      { firstName: 'Raj', lastName: 'Patel', email: 'raj@velocity.tech', company: 'Velocity', title: 'Director of Sales', status: 'bounced', ownerId: admin._id },
    ])

    const demoWorkflow = await Workflow.create({
      name: 'Cold Outreach — SaaS Founders',
      description: 'Automated cold outreach sequence for SaaS company founders and executives',
      ownerId: admin._id,
      status: 'active',
      nodes: [
        { id: 'trigger_1', type: 'trigger', position: { x: 250, y: 0 }, data: { label: 'Start', nodeType: 'trigger' } },
        { id: 'ai_1', type: 'aiMessage', position: { x: 250, y: 120 }, data: { label: 'AI Personalize', nodeType: 'aiMessage', promptTemplate: 'Write a short, friendly cold email to {{firstName}} at {{company}} who is {{title}}. Focus on how AI automation can save their team 10+ hours per week.' } },
        { id: 'delay_1', type: 'delay', position: { x: 250, y: 240 }, data: { label: 'Wait 2 hours', nodeType: 'delay', delayMinutes: 120 } },
        { id: 'email_1', type: 'sendEmail', position: { x: 250, y: 360 }, data: { label: 'Send Email', nodeType: 'sendEmail' } },
        { id: 'end_1', type: 'end', position: { x: 250, y: 480 }, data: { label: 'End', nodeType: 'end' } },
      ],
      edges: [
        { id: 'e1', source: 'trigger_1', target: 'ai_1' },
        { id: 'e2', source: 'ai_1', target: 'delay_1' },
        { id: 'e3', source: 'delay_1', target: 'email_1' },
        { id: 'e4', source: 'email_1', target: 'end_1' },
      ],
      config: { maxActionsPerHour: 50, maxActionsPerDay: 200, minDelaySeconds: 120, businessHoursOnly: false, timezone: 'UTC' },
    })

    const now = new Date()
    await WorkflowExecution.insertMany([
      { workflowId: demoWorkflow._id, leadId: leads[0]._id, ownerId: admin._id, status: 'pending', currentNodeId: 'trigger_1', stepHistory: [] },
      { workflowId: demoWorkflow._id, leadId: leads[1]._id, ownerId: admin._id, status: 'pending', currentNodeId: 'trigger_1', stepHistory: [] },
      { workflowId: demoWorkflow._id, leadId: leads[2]._id, ownerId: admin._id, status: 'running', currentNodeId: 'ai_1', stepHistory: [
        { nodeId: 'trigger_1', nodeType: 'trigger', executedAt: now, result: 'success' },
      ]},
      { workflowId: demoWorkflow._id, leadId: leads[3]._id, ownerId: admin._id, status: 'paused', currentNodeId: 'delay_1', stepHistory: [
        { nodeId: 'trigger_1', nodeType: 'trigger', executedAt: now, result: 'success' },
        { nodeId: 'ai_1', nodeType: 'aiMessage', executedAt: now, result: 'success', messageGenerated: 'Hi David, I noticed NextEra AI is doing incredible work in the AI space. As CTO, you probably deal with repetitive workflows daily — what if your team could automate 80% of those in minutes? Would love to show you how.' },
      ], nextExecutionAt: new Date(now.getTime() + 2 * 60 * 60 * 1000) },
      { workflowId: demoWorkflow._id, leadId: leads[4]._id, ownerId: admin._id, status: 'completed', currentNodeId: 'end_1', stepHistory: [
        { nodeId: 'trigger_1', nodeType: 'trigger', executedAt: now, result: 'success' },
        { nodeId: 'ai_1', nodeType: 'aiMessage', executedAt: now, result: 'success', messageGenerated: 'Hi Elena, BrightPath caught my eye — love how you are rethinking the founder journey. Quick question: what if you could personalize outreach at scale without losing the human touch?' },
        { nodeId: 'delay_1', nodeType: 'delay', executedAt: now, result: 'success', delayUsedSeconds: 7200 },
        { nodeId: 'email_1', nodeType: 'sendEmail', executedAt: now, result: 'success' },
        { nodeId: 'end_1', nodeType: 'end', executedAt: now, result: 'success' },
      ]},
      { workflowId: demoWorkflow._id, leadId: leads[5]._id, ownerId: admin._id, status: 'completed', currentNodeId: 'end_1', stepHistory: [
        { nodeId: 'trigger_1', nodeType: 'trigger', executedAt: now, result: 'success' },
        { nodeId: 'ai_1', nodeType: 'aiMessage', executedAt: now, result: 'success', messageGenerated: 'Hey Tom, CloudNine looks like a team that values engineering excellence. I bet you would appreciate a tool that automates outreach without feeling like spam. Mind if I share a 2-min demo?' },
        { nodeId: 'delay_1', nodeType: 'delay', executedAt: now, result: 'success', delayUsedSeconds: 5400 },
        { nodeId: 'email_1', nodeType: 'sendEmail', executedAt: now, result: 'success' },
        { nodeId: 'end_1', nodeType: 'end', executedAt: now, result: 'success' },
      ]},
      { workflowId: demoWorkflow._id, leadId: leads[6]._id, ownerId: admin._id, status: 'opted_out', currentNodeId: 'ai_1', stepHistory: [
        { nodeId: 'trigger_1', nodeType: 'trigger', executedAt: now, result: 'success' },
      ], errorMessage: 'Lead has opted out' },
      { workflowId: demoWorkflow._id, leadId: leads[7]._id, ownerId: admin._id, status: 'failed', currentNodeId: 'ai_1', stepHistory: [
        { nodeId: 'trigger_1', nodeType: 'trigger', executedAt: now, result: 'success' },
      ], errorMessage: 'Lead email has bounced' },
    ])

    console.log('✅ Seed complete! You can now log in with:')
    console.log('Email: admin@startup.com')
    console.log('Password: password123')
    console.log('')
    console.log('📧 Outreach demo data created:')
    console.log('   8 leads, 1 workflow, 8 executions')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to seed database:', error)
    process.exit(1)
  }
}

seed()
