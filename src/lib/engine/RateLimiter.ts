/**
 * In-memory rate limiter for workflow execution.
 * Tracks hourly and daily action counts per user.
 * In production, replace with Upstash Redis for persistence.
 */

interface BucketEntry {
  count: number
  expiresAt: number
}

const hourlyBuckets = new Map<string, BucketEntry>()
const dailyBuckets = new Map<string, BucketEntry>()

function getOrCreate(map: Map<string, BucketEntry>, key: string, ttlMs: number): BucketEntry {
  const existing = map.get(key)
  const now = Date.now()

  if (existing && existing.expiresAt > now) {
    return existing
  }

  const entry: BucketEntry = { count: 0, expiresAt: now + ttlMs }
  map.set(key, entry)
  return entry
}

export function checkRateLimit(
  userId: string,
  maxPerHour: number = 50,
  maxPerDay: number = 200
): { allowed: boolean; reason?: string } {
  const hourKey = `${userId}:hour`
  const dayKey = `${userId}:day`

  const hourBucket = getOrCreate(hourlyBuckets, hourKey, 60 * 60 * 1000)
  const dayBucket = getOrCreate(dailyBuckets, dayKey, 24 * 60 * 60 * 1000)

  if (hourBucket.count >= maxPerHour) {
    return { allowed: false, reason: `Hourly limit reached (${maxPerHour}/hr)` }
  }

  if (dayBucket.count >= maxPerDay) {
    return { allowed: false, reason: `Daily limit reached (${maxPerDay}/day)` }
  }

  hourBucket.count++
  dayBucket.count++

  return { allowed: true }
}

export function getRateLimitStatus(userId: string): { hourly: number; daily: number } {
  const hourEntry = hourlyBuckets.get(`${userId}:hour`)
  const dayEntry = dailyBuckets.get(`${userId}:day`)
  const now = Date.now()

  return {
    hourly: (hourEntry && hourEntry.expiresAt > now) ? hourEntry.count : 0,
    daily: (dayEntry && dayEntry.expiresAt > now) ? dayEntry.count : 0,
  }
}
