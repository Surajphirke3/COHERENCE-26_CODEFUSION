// src/app/api/webhooks/open/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import LeadModel from "@/lib/models/Lead";
import CampaignModel from "@/lib/models/Campaign";
import { WebhookOpenSchema } from "@/lib/validators/execution.schema";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const parsed = WebhookOpenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { trackingPixelId, openedAt } = parsed.data;

  const message = await OutreachMessageModel.findOne({ trackingPixelId });
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

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
  }

  message.openCount += 1;
  await message.save();

  return NextResponse.json({ success: true });
}
