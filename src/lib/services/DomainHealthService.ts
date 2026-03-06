// src/lib/services/DomainHealthService.ts
import dns from 'dns/promises';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { OrganizationModel, OutreachMessageModel } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DNSResult {
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
}

export interface DomainHealthResult {
  score: number;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  blacklisted: boolean;
  bounceRate: number;
  details: string[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WEIGHT_SPF = 25;
const WEIGHT_DKIM = 25;
const WEIGHT_DMARC = 20;
const WEIGHT_BOUNCE = 30;
const BOUNCE_THRESHOLD = 0.05;

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class DomainHealthService {
  /**
   * Get a comprehensive domain health score for an organisation.
   *
   * @param orgId - Organisation ID
   * @returns Domain health result with scores and details
   */
  async getScore(orgId: string): Promise<DomainHealthResult> {
    await connectDB();
    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) throw new Error(`Organisation ${orgId} not found`);

    // Extract domain from the SMTP "from" address or org name
    const fromEmail = org.smtpConfig?.from ?? '';
    const domain = fromEmail.includes('@')
      ? fromEmail.split('@')[1]
      : `${org.slug}.com`;

    const [dnsResult, blacklisted, bounceRate] = await Promise.all([
      this.checkDNS(domain),
      this.checkBlacklist(),
      this.getRecentBounceRate(orgId),
    ]);

    const score = this.calculateScore({
      ...dnsResult,
      blacklisted,
      bounceRate,
    });

    const details: string[] = [];
    if (dnsResult.spf) details.push('✅ SPF record found');
    else details.push('❌ No SPF record — emails may be marked as spam');
    if (dnsResult.dkim) details.push('✅ DKIM record found');
    else details.push('❌ No DKIM record — email authentication missing');
    if (dnsResult.dmarc) details.push('✅ DMARC policy found');
    else details.push('⚠️ No DMARC policy — domain spoofing risk');
    if (!blacklisted) details.push('✅ Not found on major blacklists');
    else details.push('🚨 Domain found on a blacklist — deliverability at risk');
    if (bounceRate < BOUNCE_THRESHOLD)
      details.push(`✅ Bounce rate ${(bounceRate * 100).toFixed(1)}% is healthy`);
    else
      details.push(
        `⚠️ Bounce rate ${(bounceRate * 100).toFixed(1)}% exceeds ${(BOUNCE_THRESHOLD * 100).toFixed(0)}% threshold`,
      );

    return {
      score,
      ...dnsResult,
      blacklisted,
      bounceRate,
      details,
    };
  }

  /**
   * Check DNS records for SPF, DKIM, and DMARC configuration.
   *
   * @param domain - Domain to check
   * @returns DNS check results
   */
  async checkDNS(domain: string): Promise<DNSResult> {
    let spf = false;
    let dkim = false;
    let dmarc = false;

    try {
      const txtRecords = await dns.resolveTxt(domain);
      const flat = txtRecords.map((r) => r.join('')).join('\n');
      spf = flat.includes('v=spf1');
    } catch {
      // No TXT records or DNS failure
    }

    try {
      const dkimRecords = await dns.resolveTxt(`default._domainkey.${domain}`);
      dkim = dkimRecords.some((r) => r.join('').includes('v=DKIM1'));
    } catch {
      // No DKIM record
    }

    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
      dmarc = dmarcRecords.some((r) => r.join('').includes('v=DMARC1'));
    } catch {
      // No DMARC record
    }

    return { spf, dkim, dmarc };
  }

  /**
   * Check whether a domain appears on common real-time blacklists.
   * Stubbed to return `false` for hackathon.
   *
   * @param _domain - Domain to check
   * @returns `true` if blacklisted
   */
  async checkBlacklist(): Promise<boolean> {
    // Stub: in production, check against services like Spamhaus, Barracuda, etc.
    return false;
  }

  /**
   * Calculate a weighted health score (0-100).
   *
   * @param checks - Combined DNS and bounce data
   * @returns Numeric score
   */
  calculateScore(checks: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    blacklisted: boolean;
    bounceRate: number;
  }): number {
    let score = 0;
    if (checks.spf) score += WEIGHT_SPF;
    if (checks.dkim) score += WEIGHT_DKIM;
    if (checks.dmarc) score += WEIGHT_DMARC;

    // Bounce rate score: full points if under threshold, proportional penalty otherwise
    if (checks.bounceRate < BOUNCE_THRESHOLD) {
      score += WEIGHT_BOUNCE;
    } else {
      const penalty = Math.min(1, checks.bounceRate / 0.2); // 20% bounce = 0 points
      score += Math.round(WEIGHT_BOUNCE * (1 - penalty));
    }

    // Blacklist penalty
    if (checks.blacklisted) {
      score = Math.max(0, score - 30);
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get the recent bounce rate for an org based on OutreachMessage records.
   *
   * @param orgId - Organisation ID
   * @returns Bounce rate as a decimal
   */
  async getRecentBounceRate(orgId: string): Promise<number> {
    await connectDB();

    const { CampaignModel } = await import('@/lib/models');
    const campaignIds = await CampaignModel.find(
      { orgId: new mongoose.Types.ObjectId(orgId) },
      { _id: 1 },
    ).lean();

    const ids = campaignIds.map((c) => c._id);
    if (ids.length === 0) return 0;

    const [total, bounced] = await Promise.all([
      OutreachMessageModel.countDocuments({
        campaignId: { $in: ids },
        status: { $in: ['sent', 'opened', 'clicked', 'replied', 'bounced'] },
      }),
      OutreachMessageModel.countDocuments({
        campaignId: { $in: ids },
        status: 'bounced',
      }),
    ]);

    return total === 0 ? 0 : bounced / total;
  }
}

export const domainHealthService = new DomainHealthService();
