// src/app/api/team/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OrganizationModel from "@/lib/models/Organization";
import UserModel from "@/lib/models/User";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: memberId } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const body = await req.json();
  const { role } = body as { role: string };

  if (!role || !["admin", "manager", "sdr", "viewer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const org = await OrganizationModel.findById(orgId);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const memberIndex = org.members.findIndex(
    (m) => m.userId.toString() === memberId
  );

  if (memberIndex === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  org.members[memberIndex].role = role;
  await org.save();

  // Also update User.role
  await UserModel.findByIdAndUpdate(memberId, { $set: { role } });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id: memberId } = await context.params;
  const orgId = (session.user as { orgId: string }).orgId;

  const org = await OrganizationModel.findById(orgId);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const memberIndex = org.members.findIndex(
    (m) => m.userId.toString() === memberId
  );

  if (memberIndex === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent removing the owner
  const member = org.members[memberIndex];
  if (member.role === "owner") {
    return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 });
  }

  org.members.splice(memberIndex, 1);
  await org.save();

  // Deactivate the user
  await UserModel.findByIdAndUpdate(memberId, { $set: { isActive: false } });

  return NextResponse.json({ success: true });
}
