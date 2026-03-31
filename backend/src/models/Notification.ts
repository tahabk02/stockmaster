import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  STOCK_ALERT = "STOCK_ALERT",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_PENDING = "ORDER_PENDING",
  SECURITY = "SECURITY"
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string; // Optional link to redirect user
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: Object.values(NotificationType), 
      default: NotificationType.INFO 
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
