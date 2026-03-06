// src/app/api/campaigns/[id]/pause/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const campaign = await CampaignModel.findOne({ _id: id, orgId });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (campaign.status !== "active") {
    return NextResponse.json({ error: "Only active campaigns can be paused" }, { status: 400 });
  }

  campaign.status = "paused";
  campaign.pausedAt = new Date();
  await campaign.save();

  return NextResponse.json({ campaign });
}
