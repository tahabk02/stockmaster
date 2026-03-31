import Notification, { NotificationType } from "../models/Notification";
import mongoose from "mongoose";

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(data: {
    userId: string | mongoose.Types.ObjectId;
    tenantId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }) {
    try {
      const notification = new Notification({
        userId: data.userId,
        tenantId: data.tenantId,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        link: data.link,
      });

      await notification.save();
      console.log(`[Notification] Created for user ${data.userId}: ${data.title}`);
      return notification;
    } catch (error) {
      console.error("[Notification Service] Error creating notification:", error);
    }
  }

  /**
   * Create a notification for all admins of a tenant and broadcast via socket
   */
  static async notifyAdmins(tenantId: string, title: string, message: string, type: NotificationType = NotificationType.INFO) {
    try {
      const { io } = require("../index");
      const User = mongoose.model("User");
      const admins = await User.find({ tenantId, role: { $in: ["ADMIN", "SUPER_ADMIN", "VENDOR"] } });
      
      const notifications = admins.map(admin => ({
        userId: admin._id,
        tenantId,
        title,
        message,
        type,
      }));

      const createdNotifications = await Notification.insertMany(notifications);
      
      // Real-time Broadcast: Emit to all admins connected
      createdNotifications.forEach(notif => {
        io.to(notif.userId.toString()).emit("new_notification", notif);
      });

      console.log(`[Notification] Broadcasted ${createdNotifications.length} signals for tenant ${tenantId}`);
    } catch (error) {
      console.error("[Notification Service] Error notifying admins:", error);
    }
  }
}
