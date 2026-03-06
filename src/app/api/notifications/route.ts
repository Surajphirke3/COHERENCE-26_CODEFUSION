// src/app/api/notifications/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationModel from "@/lib/models/Notification";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const filter: Record<string, unknown> = { userId };
  if (unreadOnly) filter.readAt = null;

  const [notifications, unreadCount] = await Promise.all([
    NotificationModel.find(filter).sort({ createdAt: -1 }).limit(50).lean(),
    NotificationModel.countDocuments({ userId, readAt: null }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const { notificationId } = body as { notificationId: string };

  if (!notificationId) {
    return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
  }

  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();

  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

  return NextResponse.json({ notification });
}
