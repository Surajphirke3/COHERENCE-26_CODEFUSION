// src/app/api/webhooks/open/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import LeadModel from "@/lib/models/Lead";
import CampaignModel from "@/lib/models/Campaign";
import ActivityModel from "@/lib/models/Activity";
import AnalyticsSnapshotModel from "@/lib/models/AnalyticsSnapshot";
import { WebhookOpenSchema } from "@/lib/validators/execution.schema";

async function recordOpen(trackingPixelId: string, openedAt?: string) {
  await connectDB();

  const message = await OutreachMessageModel.findOne({ trackingPixelId });
  if (!message) return false;

  if (!message.openedAt) {
    message.openedAt = openedAt ? new Date(openedAt) : new Date();
    message.status = "opened";

    // Update lead stage if still at contacted
    await LeadModel.findOneAndUpdate(
      { _id: message.leadId, stage: "contacted" },
      { $set: { stage: "opened", lastTouchedAt: new Date() } }
    );

    // Update campaign stats
    await CampaignModel.updateOne(
      { _id: message.campaignId },
      { $inc: { "stats.opened": 1 } }
    );

    const campaign = await CampaignModel.findById(message.campaignId).lean();
    if (campaign) {
      await ActivityModel.create({
        orgId: campaign.orgId,
        userId: campaign.createdBy || campaign.orgId,
        action: "message.opened",
        resourceType: "lead",
        resourceId: message.leadId,
        metadata: { trackingPixelId, messageId: message._id },
      });

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      await AnalyticsSnapshotModel.updateOne(
        { campaignId: message.campaignId, date: today },
        {
          $inc: { opens: 1 },
          $setOnInsert: {
            orgId: campaign.orgId,
            sends: 0,
            clicks: 0,
            replies: 0,
            bounces: 0,
            conversions: 0,
          },
        },
        { upsert: true }
      );
    }
  }

  message.openCount += 1;
  await message.save();

  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = WebhookOpenSchema.safeParse({
    trackingPixelId: searchParams.get("pid"),
    ipAddress: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  if (parsed.success) {
    await recordOpen(parsed.data.trackingPixelId);
  }

  const pixelBytes = Uint8Array.from([
    71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1, 0, 0, 1, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
  ]);
  return new NextResponse(pixelBytes, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = WebhookOpenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ok = await recordOpen(parsed.data.trackingPixelId, parsed.data.openedAt);
  if (!ok) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
