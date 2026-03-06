// src/app/api/campaigns/[id]/metrics/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";
import ExecutionModel from "@/lib/models/Execution";
import OutreachMessageModel from "@/lib/models/OutreachMessage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const campaign = await CampaignModel.findOne({ _id: id, orgId }).lean();
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const [executions, messages] = await Promise.all([
    ExecutionModel.aggregate([
      { $match: { campaignId: campaign._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    OutreachMessageModel.aggregate([
      { $match: { campaignId: campaign._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const msgStats: Record<string, number> = {};
  for (const m of messages) {
    msgStats[m._id] = m.count;
  }

  const execStats: Record<string, number> = {};
  for (const e of executions) {
    execStats[e._id] = e.count;
  }

  const sent = (msgStats.sent || 0) + (msgStats.opened || 0) + (msgStats.clicked || 0) + (msgStats.replied || 0);
  const opened = (msgStats.opened || 0) + (msgStats.clicked || 0) + (msgStats.replied || 0);
  const replied = msgStats.replied || 0;
  const bounced = msgStats.bounced || 0;
  const clicked = msgStats.clicked || 0;

  return NextResponse.json({
    sent,
    opened,
    openRate: sent > 0 ? +(opened / sent).toFixed(4) : 0,
    replied,
    replyRate: sent > 0 ? +(replied / sent).toFixed(4) : 0,
    bounced,
    clicked,
    funnel: {
      totalLeads: campaign.stats.totalLeads,
      contacted: sent,
      opened,
      clicked,
      replied,
      bounced,
      converted: campaign.stats.converted,
    },
    executionStats: execStats,
  });
}
