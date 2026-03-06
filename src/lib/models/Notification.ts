// src/lib/models/Notification.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  linkUrl?: string;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["info", "warning", "success", "error"],
    default: "info",
  },
  linkUrl: { type: String },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, readAt: 1 });
NotificationSchema.index({ orgId: 1, createdAt: -1 });

const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
