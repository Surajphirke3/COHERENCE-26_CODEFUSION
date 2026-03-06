// src/lib/services/NotificationService.ts
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import {
  NotificationModel,
  OrganizationModel,
  type INotification,
} from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NotifyPayload {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  link?: string;
  campaignId?: string;
}

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */

export class NotificationService {
  /**
   * Create a notification for a single user.
   *
   * @param userId  - Target user ID
   * @param payload - Notification content
   */
  async notify(userId: string, payload: NotifyPayload): Promise<void> {
    await connectDB();

    // Resolve orgId from the User model
    const { default: UserModel } = await import('@/lib/models/User');
    const user = await UserModel.findById(
      new mongoose.Types.ObjectId(userId),
    ).lean();
    if (!user) return;

    await NotificationModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      orgId: user.orgId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      linkUrl: payload.link,
    });
  }

  /**
   * Get all unread notifications for a user.
   *
   * @param userId - User ID
   * @returns Array of unread notification documents
   */
  async getUnread(userId: string): Promise<INotification[]> {
    await connectDB();
    return NotificationModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      readAt: null,
    })
      .sort({ createdAt: -1 })
      .lean<INotification[]>();
  }

  /**
   * Mark a single notification as read.
   *
   * @param notificationId - Notification ID
   * @param userId         - User ID (ensures ownership)
   */
  async markRead(notificationId: string, userId: string): Promise<void> {
    await connectDB();
    await NotificationModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: { readAt: new Date() } },
    );
  }

  /**
   * Mark all notifications as read for a user.
   *
   * @param userId - User ID
   */
  async markAllRead(userId: string): Promise<void> {
    await connectDB();
    await NotificationModel.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );
  }

  /**
   * Delete a notification.
   *
   * @param notificationId - Notification ID
   * @param userId         - User ID (ensures ownership)
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    await connectDB();
    await NotificationModel.deleteOne({
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /**
   * Send a notification to all members of an organisation.
   *
   * @param orgId   - Organisation ID
   * @param payload - Notification content
   */
  async notifyTeam(orgId: string, payload: NotifyPayload): Promise<void> {
    await connectDB();
    const org = await OrganizationModel.findById(
      new mongoose.Types.ObjectId(orgId),
    ).lean();
    if (!org) return;

    const notifications = org.members.map((m) => ({
      userId: m.userId,
      orgId: new mongoose.Types.ObjectId(orgId),
      title: payload.title,
      message: payload.message,
      type: payload.type,
      linkUrl: payload.link,
    }));

    if (notifications.length > 0) {
      await NotificationModel.insertMany(notifications);
    }
  }
}

export const notificationService = new NotificationService();
