// src/app/api/workflows/templates/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WorkflowTemplateModel from "@/lib/models/WorkflowTemplate";
import WorkflowModel from "@/lib/models/Workflow";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const filter: Record<string, unknown> = { isPublic: true };
  if (category) filter.category = category;

  const templates = await WorkflowTemplateModel.find(filter)
    .sort({ usageCount: -1 })
    .lean();

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { templateId } = body as { templateId: string };

  if (!templateId) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  const template = await WorkflowTemplateModel.findById(templateId);
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const orgId = (session.user as { orgId: string; id: string }).orgId;
  const userId = (session.user as { id: string }).id;

  const workflow = await WorkflowModel.create({
    orgId,
    name: template.name,
    description: template.description,
    graph: template.graph,
    version: 1,
    isTemplate: false,
    createdBy: userId,
  });

  await WorkflowTemplateModel.updateOne(
    { _id: templateId },
    { $inc: { usageCount: 1 } }
  );

  return NextResponse.json({ workflow }, { status: 201 });
}
