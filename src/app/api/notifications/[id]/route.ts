// src/app/api/notifications/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationModel from "@/lib/models/Notification";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  const notification = await NotificationModel.findOneAndDelete({ _id: id, userId });
  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
