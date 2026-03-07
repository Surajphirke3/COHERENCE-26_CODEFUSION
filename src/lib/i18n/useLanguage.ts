import { create } from 'zustand'
import { useEffect } from 'react'
import { t as translate, type LangCode } from './translations'

interface LanguageStore {
  lang: LangCode
  setLang: (lang: LangCode) => void
  hydrated: boolean
  hydrate: () => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  lang: 'en',
  hydrated: false,
  setLang: (lang) => {
    set({ lang })
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', lang)
    }
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-language') as LangCode | null
      set({ lang: saved || 'en', hydrated: true })
    }
  },
}))

// Auto-hydrating hook — just call useT() in any component, no manual hydrate needed
export function useT() {
  const lang = useLanguageStore((s) => s.lang)
  const hydrated = useLanguageStore((s) => s.hydrated)
  const hydrate = useLanguageStore((s) => s.hydrate)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  return (key: Parameters<typeof translate>[0]) => translate(key, lang)
}
