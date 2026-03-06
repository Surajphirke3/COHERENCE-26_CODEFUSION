// src/app/api/campaigns/[id]/launch/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";
import WorkflowModel from "@/lib/models/Workflow";
import LeadModel from "@/lib/models/Lead";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const campaign = await CampaignModel.findOne({ _id: id, orgId });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  if (campaign.status !== "draft" && campaign.status !== "paused") {
    return NextResponse.json({ error: "Campaign must be in draft or paused status to launch" }, { status: 400 });
  }

  if (!campaign.workflowId) {
    return NextResponse.json({ error: "Campaign must have a workflow assigned" }, { status: 400 });
  }

  const workflow = await WorkflowModel.findById(campaign.workflowId);
  if (!workflow || workflow.graph.nodes.length === 0) {
    return NextResponse.json({ error: "Workflow must have at least one node" }, { status: 400 });
  }

  if (!campaign.leadIds || campaign.leadIds.length === 0) {
    return NextResponse.json({ error: "Campaign must have at least one lead" }, { status: 400 });
  }

  const leadCount = await LeadModel.countDocuments({
    _id: { $in: campaign.leadIds },
    orgId,
  });

  if (leadCount === 0) {
    return NextResponse.json({ error: "No valid leads found" }, { status: 400 });
  }

  campaign.status = "active";
  campaign.launchedAt = new Date();
  campaign.pausedAt = undefined;
  campaign.stats.totalLeads = leadCount;
  await campaign.save();

  return NextResponse.json({ campaign });
}
