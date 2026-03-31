import { Response } from "express";
import Notification from "../models/Notification";
import mongoose from "mongoose";

export class NotificationController {
  /**
   * Get all notifications for the current user
   */
  static getAll = async (req: any, res: Response) => {
    try {
      const rawUserId = req.user?.id || req.user?._id;
      if (!rawUserId) return res.status(401).json({ success: false, message: "Non identifié" });
      
      if (!mongoose.Types.ObjectId.isValid(rawUserId)) {
        return res.status(400).json({ success: false, message: "ID utilisateur invalide" });
      }

      const userId = new mongoose.Types.ObjectId(rawUserId);
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ success: true, data: notifications });
    } catch (error: any) {
      console.error("Notification.getAll Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Get unread count
   */
  static getUnreadCount = async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const count = await Notification.countDocuments({ userId, read: false });
      res.json({ success: true, count });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Mark a notification as read
   */
  static markAsRead = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await Notification.findOneAndUpdate(
        { _id: id, userId },
        { read: true }
      );

      res.json({ success: true, message: "Notification marked as read" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Mark all notifications as read
   */
  static markAllAsRead = async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      await Notification.updateMany({ userId, read: false }, { read: true });
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Delete a notification
   */
  static delete = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await Notification.findOneAndDelete({ _id: id, userId });
      res.json({ success: true, message: "Notification deleted" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
