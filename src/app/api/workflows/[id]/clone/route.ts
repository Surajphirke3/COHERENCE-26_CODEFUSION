// src/app/api/workflows/[id]/clone/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WorkflowModel from "@/lib/models/Workflow";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const orgId = (session.user as { orgId: string; id: string }).orgId;
  const userId = (session.user as { id: string }).id;

  const original = await WorkflowModel.findOne({ _id: id, orgId }).lean();
  if (!original) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  const cloned = await WorkflowModel.create({
    orgId,
    name: `${original.name} (copy)`,
    description: original.description,
    graph: original.graph,
    version: 1,
    isTemplate: false,
    createdBy: userId,
  });

  return NextResponse.json({ workflow: cloned }, { status: 201 });
}
