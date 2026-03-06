'use client'

import useSWR from 'swr'
import { ITask } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useTasks(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<ITask[]>(
    projectId ? `/api/tasks?projectId=${projectId}` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    tasks: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useMyTasks() {
  const { data, error, isLoading, mutate } = useSWR<ITask[]>('/api/tasks?mine=true', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })

  return {
    tasks: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
