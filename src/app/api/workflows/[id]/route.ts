// src/app/api/workflows/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WorkflowModel from "@/lib/models/Workflow";
import CampaignModel from "@/lib/models/Campaign";
import { WorkflowGraphSchema } from "@/lib/validators/workflow.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const workflow = await WorkflowModel.findOne({ _id: id, orgId }).lean();
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  return NextResponse.json({ workflow });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.description !== undefined) update.description = body.description;

  if (body.graph !== undefined) {
    const graphParsed = WorkflowGraphSchema.safeParse(body.graph);
    if (!graphParsed.success) {
      return NextResponse.json({ error: graphParsed.error.flatten() }, { status: 400 });
    }
    update.graph = graphParsed.data;
    update.$inc = { version: 1 };
  }

  const workflow = await WorkflowModel.findOneAndUpdate(
    { _id: id, orgId },
    body.graph ? { $set: { ...update, graph: update.graph, name: update.name, description: update.description }, $inc: { version: 1 } } : { $set: update },
    { new: true }
  ).lean();

  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  return NextResponse.json({ workflow });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const activeCampaigns = await CampaignModel.countDocuments({
    workflowId: id,
    status: { $in: ["active", "paused"] },
  });

  if (activeCampaigns > 0) {
    return NextResponse.json(
      { error: "Cannot delete workflow with active campaigns" },
      { status: 400 }
    );
  }

  const workflow = await WorkflowModel.findOneAndDelete({ _id: id, orgId });
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
