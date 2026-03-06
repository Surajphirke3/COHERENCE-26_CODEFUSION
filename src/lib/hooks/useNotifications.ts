'use client'

import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface NotificationStore {
  notifications: Notification[]
  isOpen: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  add: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  clearAll: () => void
  unreadCount: () => number
}

export const useNotifications = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: 'welcome',
      title: 'Welcome to OutreachAI',
      message: 'Your workspace is ready. Import leads or build a workflow to get started.',
      type: 'info' as const,
      read: false,
      createdAt: new Date(),
    },
  ],
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  add: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          read: false,
          createdAt: new Date(),
        },
        ...s.notifications,
      ].slice(0, 50),
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  dismiss: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
