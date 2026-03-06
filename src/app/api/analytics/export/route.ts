// src/app/api/analytics/export/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OutreachMessageModel from "@/lib/models/OutreachMessage";
import CampaignModel from "@/lib/models/Campaign";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  // Get org campaign ids
  const campaignFilter: Record<string, unknown> = { orgId };
  if (campaignId) campaignFilter._id = campaignId;
  const campaigns = await CampaignModel.find(campaignFilter, { _id: 1 }).lean();
  const campaignIds = campaigns.map((c) => c._id);

  const messages = await OutreachMessageModel.find({
    campaignId: { $in: campaignIds },
  })
    .populate("leadId", "name email stage")
    .sort({ createdAt: 1 })
    .lean();

  // Build CSV
  const headers = ["Lead Name", "Email", "Stage", "Sent At", "Opened At", "Replied At"];
  const rows = messages.map((msg) => {
    const lead = msg.leadId as unknown as { name: string; email: string; stage: string } | null;
    return [
      lead?.name || "",
      lead?.email || "",
      lead?.stage || "",
      msg.sentAt ? new Date(msg.sentAt).toISOString() : "",
      msg.openedAt ? new Date(msg.openedAt).toISOString() : "",
      msg.repliedAt ? new Date(msg.repliedAt).toISOString() : "",
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="analytics-export-${Date.now()}.csv"`,
    },
  });
}
