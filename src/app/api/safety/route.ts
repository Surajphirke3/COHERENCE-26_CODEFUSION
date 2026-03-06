// src/app/api/safety/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OrganizationModel from "@/lib/models/Organization";
import SafetyEventModel from "@/lib/models/SafetyEvent";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import CampaignModel from "@/lib/models/Campaign";
import { SafetyConfigUpdateSchema } from "@/lib/validators/safety.schema";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const org = await OrganizationModel.findById(orgId).lean();
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  // Count today's sends
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const orgCampaigns = await CampaignModel.find({ orgId }, { _id: 1 }).lean();
  const campaignIds = orgCampaigns.map((c) => c._id);

  const todaySends = await OutreachMessageModel.countDocuments({
    campaignId: { $in: campaignIds },
    sentAt: { $gte: todayStart },
  });

  const activeAlerts = await SafetyEventModel.find({
    orgId,
    isResolved: false,
  })
    .sort({ triggeredAt: -1 })
    .lean();

  return NextResponse.json({
    domainScore: 85,
    spf: true,
    dkim: true,
    dmarc: false,
    activeAlerts,
    todaySends,
    dailyLimit: org.safetyConfig.dailyLimit,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const body = await req.json();
  const parsed = SafetyConfigUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    update[`safetyConfig.${key}`] = value;
  }

  const org = await OrganizationModel.findByIdAndUpdate(
    orgId,
    { $set: update },
    { new: true }
  ).lean();

  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  return NextResponse.json({ safetyConfig: org.safetyConfig });
}
