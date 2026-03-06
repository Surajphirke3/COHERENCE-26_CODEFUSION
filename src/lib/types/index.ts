import { Types } from 'mongoose'

// ─── User ────────────────────────────────────────────
export interface IUser {
  _id: string
  name: string
  email: string
  password?: string
  avatarUrl?: string
  role: 'admin' | 'member'
  title?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Project ─────────────────────────────────────────
export interface IProject {
  _id: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'done'
  color: string
  ownerId: string | IUser
  members: string[] | IUser[]
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// ─── Task ────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ITask {
  _id: string
  projectId: string | IProject
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string | IUser
  dueDate?: string
  position: number
  createdBy?: string | IUser
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Document ────────────────────────────────────────
export type DocType = 'prd' | 'meeting_notes' | 'technical' | 'general'

export interface IDocument {
  _id: string
  title: string
  content?: Record<string, unknown>
  type: DocType
  projectId?: string | IProject
  authorId?: string | IUser
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

// ─── Announcement ────────────────────────────────────
export interface IAnnouncement {
  _id: string
  title: string
  body?: string
  authorId?: string | IUser
  isActive: boolean
  expiresAt?: string
  createdAt: string
}

// ─── Activity Log ────────────────────────────────────
export type ActivityAction =
  | 'created_project'
  | 'updated_project'
  | 'deleted_project'
  | 'created_task'
  | 'updated_task'
  | 'moved_task'
  | 'deleted_task'
  | 'created_document'
  | 'updated_document'
  | 'deleted_document'

export type EntityType = 'project' | 'task' | 'document'

export interface IActivityLog {
  _id: string
  actorId: string | IUser
  action: ActivityAction
  entityType: EntityType
  entityId: string
  entityTitle?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// ─── NextAuth Session Extension ──────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      image?: string
    }
  }
  interface User {
    id: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// ─── AI Types ────────────────────────────────────────
export interface AIGeneratedTask {
  title: string
  description: string
  priority: TaskPriority
  estimatedHours: number
}

export interface AISummaryResult {
  summary: string
  decisions: string[]
  actionItems: { task: string; owner?: string; deadline?: string }[]
}
