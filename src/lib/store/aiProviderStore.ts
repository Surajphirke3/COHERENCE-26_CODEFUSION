'use client'

import { create } from 'zustand'
import { type AIProviderConfig, ALL_PROVIDERS } from '@/lib/ai/providers'

interface AIProviderStore {
  activeProviderId: string
  configs: Record<string, AIProviderConfig>
  setActiveProvider: (id: string) => void
  updateConfig: (id: string, partial: Partial<AIProviderConfig>) => void
  getActiveConfig: () => AIProviderConfig
  hydrated: boolean
  hydrate: () => void
}

function getDefaultConfigs(): Record<string, AIProviderConfig> {
  const configs: Record<string, AIProviderConfig> = {}
  for (const p of ALL_PROVIDERS) {
    configs[p.id] = {
      id: p.id,
      name: p.name,
      apiKey: '',
      baseUrl: p.defaultBaseUrl,
      model: p.defaultModel,
      enabled: true,
    }
  }
  return configs
}

const STORAGE_KEY = 'ai-provider-config'

function loadFromStorage(): { activeProviderId: string; configs: Record<string, AIProviderConfig> } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(activeProviderId: string, configs: Record<string, AIProviderConfig>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeProviderId, configs }))
  } catch { /* quota exceeded */ }
}

export const useAIProviderStore = create<AIProviderStore>((set, get) => ({
  activeProviderId: 'groq',
  configs: getDefaultConfigs(),
  hydrated: false,

  hydrate: () => {
    const stored = loadFromStorage()
    if (stored) {
      // Merge stored configs with defaults (in case new providers were added)
      const defaults = getDefaultConfigs()
      const merged = { ...defaults, ...stored.configs }
      set({ activeProviderId: stored.activeProviderId, configs: merged, hydrated: true })
    } else {
      set({ hydrated: true })
    }
  },

  setActiveProvider: (id) => {
    set({ activeProviderId: id })
    saveToStorage(id, get().configs)
  },

  updateConfig: (id, partial) => {
    set((s) => {
      const updated = {
        ...s.configs,
        [id]: { ...s.configs[id], ...partial },
      }
      saveToStorage(s.activeProviderId, updated)
      return { configs: updated }
    })
  },

  getActiveConfig: () => {
    const s = get()
    return s.configs[s.activeProviderId] || Object.values(s.configs)[0]
  },
}))
