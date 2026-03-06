// src/app/api/executions/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ExecutionModel from "@/lib/models/Execution";
import CampaignModel from "@/lib/models/Campaign";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  const status = searchParams.get("status");
  const leadId = searchParams.get("leadId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Verify campaign belongs to org
  if (campaignId) {
    const campaign = await CampaignModel.findOne({ _id: campaignId, orgId }).lean();
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const filter: Record<string, unknown> = {};
  if (campaignId) filter.campaignId = campaignId;
  if (status) filter.status = status;
  if (leadId) filter.leadId = leadId;

  // If no campaignId provided, scope to org campaigns
  if (!campaignId) {
    const orgCampaignIds = await CampaignModel.find({ orgId }, { _id: 1 }).lean();
    filter.campaignId = { $in: orgCampaignIds.map((c) => c._id) };
  }

  const skip = (page - 1) * limit;
  const [executions, total] = await Promise.all([
    ExecutionModel.find(filter)
      .populate("leadId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ExecutionModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    executions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
