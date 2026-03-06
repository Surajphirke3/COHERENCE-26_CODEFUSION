'use client'

import useSWR from 'swr'
import { IProject } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<IProject[]>('/api/projects', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  return {
    projects: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useProject(id: string) {
  const { data, error, isLoading, mutate } = useSWR<IProject>(
    id ? `/api/projects/${id}` : null,
    fetcher
  )

  return {
    project: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
