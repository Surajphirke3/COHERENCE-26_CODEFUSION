// src/app/api/webhooks/click/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import LeadModel from "@/lib/models/Lead";
import CampaignModel from "@/lib/models/Campaign";
import ActivityModel from "@/lib/models/Activity";
import AnalyticsSnapshotModel from "@/lib/models/AnalyticsSnapshot";
import { WebhookClickSchema } from "@/lib/validators/execution.schema";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const parsed = WebhookClickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { trackingPixelId, url, clickedAt } = parsed.data;

  const message = await OutreachMessageModel.findOne({ trackingPixelId });
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  // Set clickedAt if not already set
  if (!message.clickedAt) {
    message.clickedAt = clickedAt ? new Date(clickedAt) : new Date();
    message.status = "clicked";
  }

  message.clickCount += 1;
  await message.save();

  // Update lead stage to 'clicked' if currently 'contacted'
  await LeadModel.findOneAndUpdate(
    { _id: message.leadId, stage: "contacted" },
    { $set: { stage: "clicked", lastTouchedAt: new Date() } }
  );

  // Update campaign stats
  await CampaignModel.updateOne(
    { _id: message.campaignId },
    { $inc: { "stats.clicked": 1 } }
  );

  // Get campaign for orgId
  const campaign = await CampaignModel.findById(message.campaignId).lean();

  if (campaign) {
    // Log activity
    await ActivityModel.create({
      orgId: campaign.orgId,
      userId: campaign.createdBy || campaign.orgId,
      action: "message.clicked",
      resourceType: "lead",
      resourceId: message.leadId,
      metadata: { url, trackingPixelId, messageId: message._id },
    });

    // Update AnalyticsSnapshot clicks for this campaign+date
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

  return NextResponse.json({ success: true });
}
