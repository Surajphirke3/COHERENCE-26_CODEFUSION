// src/app/api/webhooks/bounce/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import LeadModel from "@/lib/models/Lead";
import CampaignModel from "@/lib/models/Campaign";
import { WebhookBounceSchema } from "@/lib/validators/execution.schema";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const parsed = WebhookBounceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { messageId, email, bounceType, reason } = parsed.data;

  const message = await OutreachMessageModel.findById(messageId);
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  message.status = "bounced";
  message.bouncedAt = new Date();
  await message.save();

  // Flag lead as bounced
  await LeadModel.findByIdAndUpdate(message.leadId, {
    $set: { stage: "bounced", lastTouchedAt: new Date() },
  });

  // Increment bounce counter in campaign stats
  await CampaignModel.updateOne(
    { _id: message.campaignId },
    { $inc: { "stats.bounced": 1 } }
  );

  return NextResponse.json({ success: true, bounceType, email, reason });
}
