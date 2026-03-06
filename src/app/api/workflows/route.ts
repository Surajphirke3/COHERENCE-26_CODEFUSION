// src/app/api/workflows/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WorkflowModel from "@/lib/models/Workflow";
import { WorkflowCreateSchema } from "@/lib/validators/workflow.schema";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const { searchParams } = new URL(req.url);
  const isTemplate = searchParams.get("isTemplate");

  const filter: Record<string, unknown> = { orgId };
  if (isTemplate === "true") filter.isTemplate = true;
  if (isTemplate === "false") filter.isTemplate = false;

  const workflows = await WorkflowModel.find(filter).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ workflows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const parsed = WorkflowCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orgId = (session.user as { orgId: string; id: string }).orgId;
  const userId = (session.user as { id: string }).id;

  const workflow = await WorkflowModel.create({
    ...parsed.data,
    orgId,
    createdBy: userId,
  });

  return NextResponse.json({ workflow }, { status: 201 });
}
