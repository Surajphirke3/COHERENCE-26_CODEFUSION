// src/app/api/analytics/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSnapshotModel from "@/lib/models/AnalyticsSnapshot";
import CampaignModel from "@/lib/models/Campaign";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const filter: Record<string, unknown> = { orgId: new mongoose.Types.ObjectId(orgId) };
  if (campaignId) filter.campaignId = new mongoose.Types.ObjectId(campaignId);

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    filter.date = dateFilter;
  }

  const dailyStats = await AnalyticsSnapshotModel.find(filter)
    .sort({ date: 1 })
    .lean();

  // Aggregate funnel data
  const funnelAgg = await AnalyticsSnapshotModel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalSends: { $sum: "$sends" },
        totalOpens: { $sum: "$opens" },
        totalClicks: { $sum: "$clicks" },
        totalReplies: { $sum: "$replies" },
        totalBounces: { $sum: "$bounces" },
        totalConversions: { $sum: "$conversions" },
      },
    },
  ]);

  const funnel = funnelAgg[0] || {
    totalSends: 0,
    totalOpens: 0,
    totalClicks: 0,
    totalReplies: 0,
    totalBounces: 0,
    totalConversions: 0,
  };

  // Top performing workflow
  const topWorkflow = await CampaignModel.aggregate([
    { $match: { orgId: new mongoose.Types.ObjectId(orgId), status: { $in: ["active", "completed"] } } },
    {
      $group: {
        _id: "$workflowId",
        totalReplied: { $sum: "$stats.replied" },
        totalContacted: { $sum: "$stats.contacted" },
        campaignCount: { $sum: 1 },
      },
    },
    { $sort: { totalReplied: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "workflows",
        localField: "_id",
        foreignField: "_id",
        as: "workflow",
      },
    },
    { $unwind: { path: "$workflow", preserveNullAndEmptyArrays: true } },
  ]);

  const avgReplyRate =
    funnel.totalSends > 0
      ? +(funnel.totalReplies / funnel.totalSends).toFixed(4)
      : 0;

  return NextResponse.json({
    funnelData: {
      sends: funnel.totalSends,
      opens: funnel.totalOpens,
      clicks: funnel.totalClicks,
      replies: funnel.totalReplies,
      bounces: funnel.totalBounces,
      conversions: funnel.totalConversions,
    },
    dailyStats: dailyStats.map((s) => ({
      date: s.date,
      sends: s.sends,
      opens: s.opens,
      clicks: s.clicks,
      replies: s.replies,
      bounces: s.bounces,
    })),
    topPerformingWorkflow: topWorkflow[0]
      ? {
          name: topWorkflow[0].workflow?.name || "Unknown",
          totalReplied: topWorkflow[0].totalReplied,
          campaignCount: topWorkflow[0].campaignCount,
        }
      : null,
    avgReplyRate,
  });
}
