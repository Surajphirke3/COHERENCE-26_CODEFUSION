// src/lib/services/EmailService.ts
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  OrganizationModel,
  OutreachMessageModel,
  type ISmtpConfig,
  type IOutreachMessage,
  type ILead,
} from '@/lib/models';
import { generateId } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export interface PersonalizedEmail {
  subject: string;
  body: string;
}

export interface SendOptions {
  campaignId: string;
  leadId: string;
  trackingPixelId: string;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class EmailService {
  private transporterCache = new Map<string, Mail>();

  /**
   * Create or retrieve a cached nodemailer transporter for the given SMTP config.
   *
   * @param smtpConfig - SMTP connection details
   * @returns A nodemailer Transporter
   */
  createTransport(smtpConfig: ISmtpConfig): Mail {
    const key = `${smtpConfig.host}:${smtpConfig.port}:${smtpConfig.user}`;
    if (this.transporterCache.has(key)) {
      return this.transporterCache.get(key)!;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.passEncrypted, // In production, decrypt first
      },
    });

    this.transporterCache.set(key, transporter);
    return transporter;
  }

  /**
   * Inject a 1×1 tracking pixel image tag into the HTML body.
   *
   * @param htmlBody        - Original HTML email body
   * @param trackingPixelId - Unique pixel identifier
   * @returns HTML with the tracking pixel appended
   */
  injectTrackingPixel(htmlBody: string, trackingPixelId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const pixel = `<img src="${baseUrl}/api/webhooks/open?pid=${trackingPixelId}" width="1" height="1" alt="" style="display:none" />`;
    return htmlBody + pixel;
  }

  /**
   * Wrap all `<a href>` links in the HTML body with a click-tracking redirect.
   *
   * @param htmlBody   - Original HTML email body
   * @param campaignId - Campaign ID for attribution
   * @param leadId     - Lead ID for attribution
   * @returns HTML with click-tracked links
   */
  injectClickTracking(
    htmlBody: string,
    campaignId: string,
    leadId: string,
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    return htmlBody.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (_match, url: string) => {
        const tracked = `${baseUrl}/api/webhooks/click?cid=${campaignId}&lid=${leadId}&url=${encodeURIComponent(url)}`;
        return `href="${tracked}"`;
      },
    );
  }

  /**
   * Send an email via the configured SMTP transport.
   *
   * @param to      - Recipient email address
   * @param subject - Email subject line
   * @param htmlBody - HTML email body
   * @param options - Send options (campaignId, leadId, trackingPixelId)
   * @returns Result with messageId and accepted/rejected arrays
   */
  async send(
    to: string,
    subject: string,
    htmlBody: string,
    options: SendOptions,
  ): Promise<SendResult> {
    await connectDB();

    // Get SMTP config for the org associated with the campaign
    const { CampaignModel } = await import('@/lib/models');
    const campaign = await CampaignModel.findById(
      new mongoose.Types.ObjectId(options.campaignId),
    ).lean();
    if (!campaign) throw new Error(`Campaign ${options.campaignId} not found`);

    const smtpConfig = await this.getSmtpConfig(campaign.orgId.toString());
    const transporter = this.createTransport(smtpConfig);

    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to,
      subject,
      html: htmlBody,
    });

    return {
      messageId: info.messageId ?? '',
      accepted: Array.isArray(info.accepted)
        ? info.accepted.map(String)
        : [],
      rejected: Array.isArray(info.rejected)
        ? info.rejected.map(String)
        : [],
    };
  }

  /**
   * Send an email with full tracking (pixel + click), then create the OutreachMessage record.
   *
   * @param lead                - Target lead
   * @param personalizedMessage - Generated subject and body
   * @param campaignId          - Campaign identifier
   * @returns The created OutreachMessage document
   */
  async sendWithTracking(
    lead: ILead,
    personalizedMessage: PersonalizedEmail,
    campaignId: string,
  ): Promise<IOutreachMessage> {
    await connectDB();

    const trackingPixelId = generateId();
    let htmlBody = personalizedMessage.body;

    // Inject tracking
    htmlBody = this.injectTrackingPixel(htmlBody, trackingPixelId);
    htmlBody = this.injectClickTracking(htmlBody, campaignId, lead._id.toString());

    // Send
    const sendResult = await this.send(lead.email, personalizedMessage.subject, htmlBody, {
      campaignId,
      leadId: lead._id.toString(),
      trackingPixelId,
    });

    // Create OutreachMessage document
    const outreachMsg = await OutreachMessageModel.create({
      executionId: new mongoose.Types.ObjectId(), // will be updated by the caller
      campaignId: new mongoose.Types.ObjectId(campaignId),
      leadId: lead._id,
      subject: personalizedMessage.subject,
      body: personalizedMessage.body,
      status: sendResult.rejected.length > 0 ? 'failed' : 'sent',
      trackingPixelId,
      sentAt: new Date(),
    });

    return outreachMsg;
  }

  /**
   * Test whether an SMTP configuration is valid by verifying the connection.
   *
   * @param smtpConfig - SMTP config to test
   * @returns `true` if the connection succeeds
   */
  async testConnection(smtpConfig: ISmtpConfig): Promise<boolean> {
    try {
      const transporter = this.createTransport(smtpConfig);
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch the SMTP config from the Organisation document.
   *
   * @param orgId - Organisation ID
   * @returns SMTP configuration
   * @throws Error if org or SMTP config is not found
   */
  async getSmtpConfig(orgId: string): Promise<ISmtpConfig> {
    await connectDB();
    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) throw new Error(`Organisation ${orgId} not found`);
    if (!org.smtpConfig) throw new Error(`No SMTP config for org ${orgId}`);
    return org.smtpConfig;
  }
}

export const emailService = new EmailService();
