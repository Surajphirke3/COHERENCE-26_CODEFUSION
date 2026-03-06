// src/app/api/notifications/read-all/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationModel from "@/lib/models/Notification";

export async function PATCH(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id: string }).id;

  const result = await NotificationModel.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
}
