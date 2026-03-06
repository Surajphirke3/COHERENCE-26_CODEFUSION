// src/app/api/webhooks/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import LeadModel from "@/lib/models/Lead";
import ActivityModel from "@/lib/models/Activity";
import CampaignModel from "@/lib/models/Campaign";
import { WebhookReplySchema } from "@/lib/validators/execution.schema";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const parsed = WebhookReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { messageId, fromEmail, subject, body: replyBody, receivedAt } = parsed.data;

  const message = await OutreachMessageModel.findById(messageId);
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  message.status = "replied";
  message.repliedAt = receivedAt ? new Date(receivedAt) : new Date();
  await message.save();

  // Update lead stage
  await LeadModel.findByIdAndUpdate(message.leadId, {
    $set: { stage: "replied", lastTouchedAt: new Date() },
  });

  // Update campaign stats
  await CampaignModel.updateOne(
    { _id: message.campaignId },
    { $inc: { "stats.replied": 1 } }
  );

  // Get campaign for orgId
  const campaign = await CampaignModel.findById(message.campaignId).lean();

  // Log activity
  if (campaign) {
    await ActivityModel.create({
      orgId: campaign.orgId,
      userId: campaign.createdBy || campaign.orgId,
      action: "message.replied",
      resourceType: "lead",
      resourceId: message.leadId,
      metadata: { fromEmail, subject, replyBody, messageId },
    });
  }

  return NextResponse.json({ success: true });
}
