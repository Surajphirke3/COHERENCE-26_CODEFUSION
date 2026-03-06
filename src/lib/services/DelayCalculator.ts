// src/lib/services/DelayCalculator.ts
import type { ISafetyConfig } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WaitNodeConfig {
  duration: number;
  unit: 'minutes' | 'hours' | 'days';
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Minimum inter-message delay in milliseconds (2 minutes) */
export const MIN_SEND_DELAY = 2 * 60 * 1000;

/** Maximum inter-message delay in milliseconds (8 minutes) */
export const MAX_SEND_DELAY = 8 * 60 * 1000;

const UNIT_TO_MS: Record<WaitNodeConfig['unit'], number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class DelayCalculator {
  /**
   * Apply random jitter to a base delay value.
   *
   * @param baseMs  - Base delay in milliseconds
   * @param jitterPercent - Fraction of base to randomise (default ±20 %)
   * @returns The jittered delay in milliseconds
   */
  calculateDelay(baseMs: number, jitterPercent = 0.2): number {
    const jitter = baseMs * jitterPercent;
    return Math.round(baseMs + (Math.random() * 2 - 1) * jitter);
  }

  /**
   * Convert a wait-node configuration to a delay in milliseconds with jitter.
   *
   * @param nodeConfig - The wait node's duration / unit config
   * @returns Delay in milliseconds
   */
  nodeDelay(nodeConfig: WaitNodeConfig): number {
    const baseMs = nodeConfig.duration * UNIT_TO_MS[nodeConfig.unit];
    return this.calculateDelay(baseMs);
  }

  /**
   * Compute the inter-message send delay from an org's safety config,
   * picking a random value between minDelayMs and maxDelayMs with ±20 % jitter.
   *
   * @param orgConfig - Organisation safety configuration
   * @returns Delay in milliseconds
   */
  sendDelay(orgConfig: Pick<ISafetyConfig, 'minDelayMs' | 'maxDelayMs'>): number {
    const min = Math.max(orgConfig.minDelayMs, MIN_SEND_DELAY);
    const max = Math.min(orgConfig.maxDelayMs, MAX_SEND_DELAY);
    const baseMs = min + Math.random() * (max - min);
    return this.calculateDelay(baseMs);
  }

  /**
   * Check whether the current wall-clock time falls within the allowed
   * send window (e.g. 09:00 – 18:00).
   *
   * @param timeWindowStart - Start hour (0-23)
   * @param timeWindowEnd   - End hour (0-23)
   * @param timezone        - IANA timezone string (default: system tz)
   * @returns `true` when sending is allowed right now
   */
  isWithinTimeWindow(
    timeWindowStart: number,
    timeWindowEnd: number,
    timezone?: string,
  ): boolean {
    const now = new Date();
    const hour = timezone
      ? parseInt(
          new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone,
          }).format(now),
          10,
        )
      : now.getHours();

    return hour >= timeWindowStart && hour < timeWindowEnd;
  }

  /**
   * Calculate the next valid send time if we are currently outside the
   * allowed time window.
   *
   * @param timeWindowStart - Start hour (0-23)
   * @param timeWindowEnd   - End hour (0-23)
   * @returns A `Date` representing the next valid send moment
   */
  nextSendTime(timeWindowStart: number): Date {
    const now = new Date();
    const next = new Date(now);
    next.setHours(timeWindowStart, 0, 0, 0);

    // If the window start has already passed today, move to tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}

export const delayCalculator = new DelayCalculator();
