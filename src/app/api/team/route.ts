// src/app/api/team/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OrganizationModel from "@/lib/models/Organization";
import UserModel from "@/lib/models/User";
import { InviteSchema } from "@/lib/validators/auth.schema";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orgId = (session.user as { orgId: string }).orgId;

  const org = await OrganizationModel.findById(orgId).lean();
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const memberUserIds = org.members.map((m) => m.userId);
  const users = await UserModel.find(
    { _id: { $in: memberUserIds } },
    { name: 1, email: 1, role: 1, avatar: 1, isActive: 1, lastLoginAt: 1 }
  ).lean();

  const members = org.members.map((m) => {
    const user = users.find((u) => u._id.toString() === m.userId.toString());
    return {
      ...m,
      user: user || null,
    };
  });

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, role } = parsed.data;
  const orgId = (session.user as { orgId: string }).orgId;

  // Check if user already exists
  let user = await UserModel.findOne({ email: email.toLowerCase() });

  if (user) {
    // Check if already a member
    const org = await OrganizationModel.findById(orgId);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const alreadyMember = org.members.some(
      (m) => m.userId.toString() === user!._id.toString()
    );

    if (alreadyMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    // Add to org
    org.members.push({
      userId: user._id,
      role,
      joinedAt: new Date(),
    });
    await org.save();

    // Update user's orgId
    user.orgId = org._id;
    user.role = role as "owner" | "admin" | "manager" | "sdr" | "viewer";
    await user.save();
  } else {
    // Create a pending user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    user = await UserModel.create({
      name: email.split("@")[0],
      email: email.toLowerCase(),
      passwordHash,
      role,
      orgId,
    });

    const org = await OrganizationModel.findById(orgId);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    org.members.push({
      userId: user._id,
      role,
      joinedAt: new Date(),
    });
    await org.save();
  }

  return NextResponse.json({ success: true, userId: user._id }, { status: 201 });
}
