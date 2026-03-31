import { Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import Product from "../models/Product";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuditService, AuditAction } from "../services/audit.service";

export class UserController {
  static getProfile = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id || req.user?._id;

      const user = (await User.findById(id).select("-password").lean()) as any;
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Utilisateur non trouvé" });

      const isFollowing = user.followers?.some(
        (uid: any) => uid.toString() === currentUserId.toString(),
      );

      res.status(200).json({
        success: true,
        data: {
          ...user,
          isFollowing,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Récupérer les membres de l'équipe du même tenant
  static getTeam = async (req: any, res: Response) => {
    try {
      const { tenantId, role } = req.user;
      const { global } = req.query;

      const isGlobalAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

      // Si global=true ET admin, on renvoie tout le monde
      // Sinon on filtre par tenantId
      const filter =
        (global === "true" && isGlobalAdmin) ? { isActive: true } : { tenantId, isActive: true };

      const team = await User.find(filter)
        .select("-password")
        .sort({ name: 1 });
      res.status(200).json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getTeamPerformance = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;

      const performance = await Order.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: "$userId",
            salesCount: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            name: "$userInfo.name",
            email: "$userInfo.email",
            role: "$userInfo.role",
            salesCount: 1,
            revenue: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      res.json({ success: true, data: performance });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getUserActivity = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;

      const orders = await Order.find({ userId: id, tenantId })
        .populate("items.productId")
        .sort({ createdAt: -1 })
        .limit(20);

      // Monthly activity for chart
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const stats = await Order.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(id),
            tenantId,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({
        success: true,
        data: {
          recentOrders: orders,
          chartData: stats.map((s) => ({
            month: s._id,
            amount: s.revenue,
            count: s.count,
          })),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Créer un nouveau membre (Admin only)
  static createMember = async (req: any, res: Response) => {
    try {
      const { name, email, password, role, jobTitle } = req.body;
      const { tenantId } = req.user;

      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Cet email est déjà utilisé." });
      }

      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password, // Sera haché par le middleware pre-save
        role: role || "STAFF",
        jobTitle: jobTitle || "Membre de l'équipe",
        tenantId,
        isActive: true,
      });

      const userResponse = newUser.toObject() as any;
      delete userResponse.password;

      // Forensic Signal
      await AuditService.log(
        tenantId,
        req.user._id,
        AuditAction.AGENT_ONBOARDED,
        `New agent onboarded: ${name} (${email})`,
        { targetUserId: newUser._id, role },
      );

      res.status(201).json({ success: true, data: userResponse });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Mettre à jour un membre (Admin only)
  static updateMember = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { name, role, jobTitle, isActive } = req.body;
      const { tenantId } = req.user;

      const user = await User.findOneAndUpdate(
        { _id: id, tenantId },
        { name, role, jobTitle, isActive },
        { new: true },
      ).select("-password");

      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Membre introuvable" });

      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Supprimer un membre de l'équipe
  static removeMember = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;

      if (id === req.user.id) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Vous ne pouvez pas vous supprimer vous-même",
          });
      }

      await User.findOneAndDelete({ _id: id, tenantId });

      // Forensic Signal
      await AuditService.log(
        tenantId,
        req.user._id,
        AuditAction.AGENT_REMOVED,
        `Agent removed from cluster node: ${id}`,
        { targetUserId: id },
      );

      res.status(200).json({ success: true, message: "Membre supprimé" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static updatePreferences = async (req: any, res: Response) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const { language, notifications, darkMode } = req.body;

      const update: any = {};
      if (typeof language !== "undefined")
        update["preferences.language"] = language;
      if (typeof notifications !== "undefined")
        update["preferences.notifications"] = notifications;
      if (typeof darkMode !== "undefined")
        update["preferences.darkMode"] = darkMode;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true },
      ).select("-password");
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Utilisateur non trouvé" });

      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static toggleFollow = async (req: any, res: Response) => {
    try {
      const { id: currentUserId } = req.user;
      const { id: targetUserId } = req.params;

      if (currentUserId === targetUserId)
        return res
          .status(400)
          .json({ message: "Vous ne pouvez pas vous suivre vous-même" });

      const targetUser = (await User.findById(targetUserId)) as any;
      const currentUser = (await User.findById(currentUserId)) as any;

      if (!targetUser || !currentUser)
        return res.status(404).json({ message: "Utilisateur non trouvé" });

      const isFollowing = currentUser.following.includes(targetUserId);

      if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(
          (uid: any) => uid.toString() !== targetUserId,
        );
        targetUser.followers = targetUser.followers.filter(
          (uid: any) => uid.toString() !== currentUserId,
        );
      } else {
        // Follow
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
      }

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({ isFollowing: !isFollowing });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}
