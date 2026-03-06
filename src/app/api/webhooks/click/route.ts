// src/app/api/webhooks/click/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import LeadModel from "@/lib/models/Lead";
import CampaignModel from "@/lib/models/Campaign";
import ActivityModel from "@/lib/models/Activity";
import AnalyticsSnapshotModel from "@/lib/models/AnalyticsSnapshot";
import { WebhookClickSchema } from "@/lib/validators/execution.schema";

async function recordClick(trackingPixelId: string, url: string, clickedAt?: string) {
  await connectDB();

  const message = await OutreachMessageModel.findOne({ trackingPixelId });
  if (!message) return false;

  if (!message.clickedAt) {
    message.clickedAt = clickedAt ? new Date(clickedAt) : new Date();
    message.status = "clicked";
  }

  message.clickCount += 1;
  await message.save();

  await LeadModel.findOneAndUpdate(
    { _id: message.leadId, stage: "contacted" },
    { $set: { stage: "clicked", lastTouchedAt: new Date() } }
  );

  await CampaignModel.updateOne(
    { _id: message.campaignId },
    { $inc: { "stats.clicked": 1 } }
  );

  const campaign = await CampaignModel.findById(message.campaignId).lean();

  if (campaign) {
    await ActivityModel.create({
      orgId: campaign.orgId,
      userId: campaign.createdBy || campaign.orgId,
      action: "message.clicked",
      resourceType: "lead",
      resourceId: message.leadId,
      metadata: { url, trackingPixelId, messageId: message._id },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await AnalyticsSnapshotModel.updateOne(
      { campaignId: message.campaignId, date: today },
      {
        $inc: { clicks: 1 },
        $setOnInsert: {
          orgId: campaign.orgId,
          sends: 0,
          opens: 0,
          replies: 0,
          bounces: 0,
          conversions: 0,
        },
      },
      { upsert: true }
    );
  }

  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = WebhookClickSchema.safeParse({
    trackingPixelId: searchParams.get("pid"),
    campaignId: searchParams.get("cid") || undefined,
    leadId: searchParams.get("lid") || undefined,
    url: searchParams.get("url"),
    ipAddress: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/campaigns", req.url));
  }

  await recordClick(parsed.data.trackingPixelId, parsed.data.url);
  return NextResponse.redirect(parsed.data.url);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = WebhookClickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ok = await recordClick(parsed.data.trackingPixelId, parsed.data.url, parsed.data.clickedAt);
  if (!ok) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
