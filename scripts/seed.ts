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

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)

async function seed() {
  try {
    console.log('🌱 Connecting to database...')
    await mongoose.connect(MONGODB_URI!)

    console.log('🧹 Clearing existing data...')
    await User.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})

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

    console.log('✅ Seed complete! You can now log in with:')
    console.log('Email: admin@startup.com')
    console.log('Password: password123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to seed database:', error)
    process.exit(1)
  }
}

seed()
