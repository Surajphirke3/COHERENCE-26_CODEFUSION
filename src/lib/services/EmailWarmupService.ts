// src/lib/services/EmailWarmupService.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { OrganizationModel } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WarmupDay {
  day: number;
  date: Date;
  allowedSends: number;
}

export interface WarmupStatus {
  isWarming: boolean;
  currentDay: number;
  todayLimit: number;
  targetLimit: number;
  percentComplete: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WARMUP_DURATION_DAYS = 30;
const WARMUP_INITIAL = 5;
const WARMUP_GROWTH_RATE = 1.3; // ~30% daily growth

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class EmailWarmupService {
  /**
   * Generate a 30-day warmup schedule starting from a given date.
   *
   * @param startDate        - Date warmup begins
   * @param targetDailyLimit - The eventual full daily send limit
   * @returns Array of per-day warmup entries
   */
  getWarmupSchedule(startDate: Date, targetDailyLimit: number): WarmupDay[] {
    const schedule: WarmupDay[] = [];
    let currentAllowed = WARMUP_INITIAL;

    for (let day = 1; day <= WARMUP_DURATION_DAYS; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (day - 1));

      schedule.push({
        day,
        date,
        allowedSends: Math.min(Math.round(currentAllowed), targetDailyLimit),
      });

      currentAllowed *= WARMUP_GROWTH_RATE;
      if (currentAllowed > targetDailyLimit) {
        currentAllowed = targetDailyLimit;
      }
    }

    return schedule;
  }

  /**
   * Get the allowed daily send limit for an org today, respecting warmup.
   *
   * @param orgId - Organisation ID
   * @returns Today's allowed send count
   */
  async getCurrentDayLimit(orgId: string): Promise<number> {
    await connectDB();

    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    const targetLimit = org.safetyConfig.dailyLimit;
    const createdAt = org.createdAt;
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000),
    );

    if (daysSinceCreation >= WARMUP_DURATION_DAYS) {
      return targetLimit;
    }

    const schedule = this.getWarmupSchedule(new Date(createdAt), targetLimit);
    const todayEntry = schedule[daysSinceCreation] ?? schedule[schedule.length - 1];
    return todayEntry.allowedSends;
  }

  /**
   * Check whether an org is still within its warmup period.
   *
   * @param orgId - Organisation ID
   * @returns `true` if still warming up
   */
  async isInWarmupPeriod(orgId: string): Promise<boolean> {
    await connectDB();

    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) return false;

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(org.createdAt).getTime()) / (24 * 60 * 60 * 1000),
    );

    return daysSinceCreation < WARMUP_DURATION_DAYS;
  }

  /**
   * Get a full warmup status snapshot for dashboard display.
   *
   * @param orgId - Organisation ID
   * @returns Warmup status object
   */
  async getWarmupStatus(orgId: string): Promise<WarmupStatus> {
    await connectDB();

    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    const targetLimit = org.safetyConfig.dailyLimit;
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(org.createdAt).getTime()) / (24 * 60 * 60 * 1000),
    );

    const isWarming = daysSinceCreation < WARMUP_DURATION_DAYS;
    const currentDay = Math.min(daysSinceCreation + 1, WARMUP_DURATION_DAYS);

    let todayLimit = targetLimit;
    if (isWarming) {
      const schedule = this.getWarmupSchedule(new Date(org.createdAt), targetLimit);
      todayLimit = schedule[daysSinceCreation]?.allowedSends ?? targetLimit;
    }

    const percentComplete = isWarming
      ? Math.round((currentDay / WARMUP_DURATION_DAYS) * 100)
      : 100;

    return {
      isWarming,
      currentDay,
      todayLimit,
      targetLimit,
      percentComplete,
    };
  }
}

export const emailWarmupService = new EmailWarmupService();
