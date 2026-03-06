/**
 * Delay Scheduler for workflow execution.
 * Computes human-like random delays and respects business hours.
 */

/**
 * Compute a random delay using Box-Muller transform for gaussian distribution.
 * This creates more "human-like" delays clustered around the midpoint.
 */
export function computeDelay(minSeconds: number, maxSeconds: number, gaussian = true): number {
  if (!gaussian) {
    return minSeconds + Math.random() * (maxSeconds - minSeconds)
  }

  // Box-Muller transform for gaussian distribution
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

  const mean = (minSeconds + maxSeconds) / 2
  const stdDev = (maxSeconds - minSeconds) / 6

  const delay = mean + z * stdDev
  return Math.max(minSeconds, Math.min(maxSeconds, delay))
}

/**
 * Calculate the next execution time, optionally respecting business hours (9am-6pm Mon-Fri).
 */
export function nextExecTime(
  delaySeconds: number,
  businessHoursOnly = false,
  timezone = 'UTC'
): Date {
  let execTime = new Date(Date.now() + delaySeconds * 1000)

  if (!businessHoursOnly) {
    return execTime
  }

  // Adjust to business hours
  const hour = execTime.getUTCHours()
  const day = execTime.getUTCDay()

  // If weekend, push to Monday 9am
  if (day === 0) {
    execTime.setUTCDate(execTime.getUTCDate() + 1)
    execTime.setUTCHours(9, 0, 0, 0)
  } else if (day === 6) {
    execTime.setUTCDate(execTime.getUTCDate() + 2)
    execTime.setUTCHours(9, 0, 0, 0)
  }
  // If before 9am, push to 9am
  else if (hour < 9) {
    execTime.setUTCHours(9, 0, 0, 0)
  }
  // If after 6pm, push to next business day 9am
  else if (hour >= 18) {
    execTime.setUTCDate(execTime.getUTCDate() + (day === 5 ? 3 : 1))
    execTime.setUTCHours(9, 0, 0, 0)
  }

  return execTime
}
