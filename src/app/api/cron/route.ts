// src/app/api/cron/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CampaignModel from "@/lib/models/Campaign";
import LeadModel from "@/lib/models/Lead";
import WorkflowModel from "@/lib/models/Workflow";
import ExecutionModel from "@/lib/models/Execution";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Find all active campaigns
  const activeCampaigns = await CampaignModel.find({ status: "active" }).lean();

  let totalExecutionsCreated = 0;

  for (const campaign of activeCampaigns) {
    if (!campaign.workflowId || !campaign.leadIds?.length) continue;

    const workflow = await WorkflowModel.findById(campaign.workflowId).lean();
    if (!workflow || workflow.graph.nodes.length === 0) continue;

    // Get leads in 'pending' or 'imported' stage for this campaign
    const leads = await LeadModel.find({
      _id: { $in: campaign.leadIds },
      stage: { $in: ["pending", "imported"] },
    }).lean();

    if (leads.length === 0) continue;

    // Get the first node in the workflow as the starting point
    const firstNode = workflow.graph.nodes[0];

    for (const lead of leads) {
      // Check if execution already exists for this campaign+lead+node
      const existingExec = await ExecutionModel.findOne({
        campaignId: campaign._id,
        leadId: lead._id,
        nodeId: firstNode.id,
      }).lean();

      if (existingExec) continue;

      // Determine action from node type
      const actionMap: Record<string, string> = {
        email: "email",
        wait: "wait",
        condition: "condition_check",
        linkedin: "linkedin",
        ai_generate: "ai_generate",
      };

      const action = actionMap[firstNode.type] || "email";

      await ExecutionModel.create({
        campaignId: campaign._id,
        leadId: lead._id,
        nodeId: firstNode.id,
        action,
        status: "pending",
        scheduledAt: new Date(),
      });

      totalExecutionsCreated++;
    }

    // Update leads to 'pending' stage if they were 'imported'
    await LeadModel.updateMany(
      {
        _id: { $in: leads.filter((l) => l.stage === "imported").map((l) => l._id) },
      },
      { $set: { stage: "pending", lastTouchedAt: new Date() } }
    );
  }

  return NextResponse.json({
    success: true,
    campaignsProcessed: activeCampaigns.length,
    executionsCreated: totalExecutionsCreated,
  });
}
