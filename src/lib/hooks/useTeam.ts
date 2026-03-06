'use client'

import useSWR from 'swr'
import { IUser } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useTeam() {
  const { data, error, isLoading, mutate } = useSWR<IUser[]>('/api/team', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  return {
    members: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
