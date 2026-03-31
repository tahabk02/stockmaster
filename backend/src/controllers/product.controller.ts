import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import { Category } from "../models/Category";
import { NotificationService } from "../services/notification.service";
import { cloudinary } from "../config/cloudinary";
import { UserRole } from "../enums/UserRole";
import { AuditService, AuditAction } from "../services/audit.service";
import Post from "../models/Post";
import { io } from "../index";

interface RequestWithUser extends Request {
  user: {
    _id: string;
    email: string;
    role: UserRole;
    tenantId: string;
  };
}

export class ProductController {
  static getAll = async (req: any, res: Response) => {
    try {
      const { tenantId: userTenantId, role } = req.user;
      const { tenantId: queryTenantId } = req.query;
      
      console.log(`[Product BI] Request from user: ${req.user.email}, Role: ${role}, Tenant: ${userTenantId}, Query Tenant: ${queryTenantId}`);

      let filter: any = {};

      if (queryTenantId) {
        // Public/Community view of a specific store
        filter = { tenantId: queryTenantId };
      } else {
        // Dashboard view: restricted by role and tenant
        const isGlobalAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
        
        filter = isGlobalAdmin ? {} : { tenantId: userTenantId };
      }

      console.log(`[Product BI] Applied filter:`, JSON.stringify(filter));

      const products = await Product.find(filter)
        .populate("category")
        .sort({ createdAt: -1 });

      console.log(`[Product BI] Found ${products.length} products in database.`);

      return res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error: any) {
      console.error("[Product BI] Critical error in getAll:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Neural Feed Error: Connection to Asset Registry compromised.",
        error: error.message,
        stack: error.stack,
        context: {
          userEmail: req.user?.email,
          userRole: req.user?.role,
          tenantId: req.user?.tenantId
        }
      });
    }
  };

  static getById = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { role, tenantId } = req.user;

      const filter = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN 
        ? { _id: id } 
        : { _id: id, tenantId };

      const product = await Product.findOne(filter).populate("category");

      if (!product) {
        return res.status(404).json({ success: false, message: "Asset not found in registry" });
      }

      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static create = async (req: any, res: Response) => {
    try {
      const { name, sku, price, quantity, image, gallery, description, detailedDescription, category, brand, location } =
        req.body;
      const { tenantId } = req.user;

      if (!tenantId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "User is not associated with a tenant.",
          });
      }

      let imageUrl = "";
      if (image && image.startsWith("data:image")) {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: "stockmaster_products",
        });
        imageUrl = uploadRes.secure_url;
      }

      let galleryUrls = [];
      if (gallery && Array.isArray(gallery)) {
        for (const img of gallery) {
          if (img.startsWith("data:image")) {
            const up = await cloudinary.uploader.upload(img, { folder: "stockmaster_gallery" });
            galleryUrls.push(up.secure_url);
          } else {
            galleryUrls.push(img);
          }
        }
      }

      const newProduct = new Product({
        name,
        description: description || "",
        detailedDescription: detailedDescription || "",
        price: Number(price) || 0,
        quantity: Number(quantity) || 0,
        sku: sku || `SKU-${Date.now()}`,
        image: imageUrl,
        gallery: galleryUrls,
        category: category || null,
        brand: brand || "",
        location: location || "",
        tenantId,
      });

      await newProduct.save();

      // Community Signal: Auto-generate post if Vendor
      if (req.user.role === UserRole.VENDOR) {
        try {
          const autoPost = await Post.create({
            tenantId,
            author: req.user._id,
            content: `New Asset Provisioned: ${name}. Strategic indexing complete.`,
            mediaUrl: imageUrl,
            mediaType: imageUrl ? "IMAGE" : "NONE",
            postType: "ASSET_ALERT",
            metadata: {
              productId: newProduct._id
            },
            tags: ["NEW_ASSET", "PROVISIONING", brand].filter(Boolean)
          });
          await autoPost.populate("author", "name avatar jobTitle role");
          io.emit("postCreated", autoPost);

          await NotificationService.createNotification({
            userId: req.user._id,
            tenantId,
            title: "Signal Communautaire Émis",
            message: `Votre nouveau produit ${name} a été partagé avec succès dans le feed global.`,
            type: "SUCCESS" as any
          });
        } catch (postErr) {
          console.error("[Community Signal] Failed to generate auto-post:", postErr);
        }
      }

      // Forensic Signal
      await AuditService.log(
        tenantId,
        req.user._id,
        AuditAction.ASSET_CREATED,
        `Asset Initialized: ${name} (SKU: ${newProduct.sku})`,
        { productId: newProduct._id }
      );

      const populatedProduct = await Product.findById(newProduct._id).populate("category");
      res.status(201).json({ success: true, data: populatedProduct });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ success: false, message });
    }
  };

  static update = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { role, tenantId } = req.user;
      const { name, sku, price, quantity, image, gallery, description, detailedDescription, category, brand, location } = req.body;

      const filter = role === UserRole.ADMIN ? { _id: id } : { _id: id, tenantId };

      const product = await Product.findOne(filter);

      if (!product) {
        return res.status(404).json({ success: false, message: "Produit introuvable dans le registre" });
      }

      let imageUrl = product.image;
      if (image && image.startsWith("data:image")) {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: "stockmaster_products",
        });
        imageUrl = uploadRes.secure_url;
      }

      let galleryUrls = product.gallery || [];
      if (gallery && Array.isArray(gallery)) {
        galleryUrls = [];
        for (const img of gallery) {
          if (img.startsWith("data:image")) {
            const up = await cloudinary.uploader.upload(img, { folder: "stockmaster_gallery" });
            galleryUrls.push(up.secure_url);
          } else {
            galleryUrls.push(img);
          }
        }
      }

      const updateData = {
        name: name || product.name,
        sku: sku || product.sku,
        price: price !== undefined ? Number(price) : product.price,
        quantity: quantity !== undefined ? Number(quantity) : product.quantity,
        description: description || product.description,
        detailedDescription: detailedDescription || product.detailedDescription,
        category: category || product.category,
        brand: brand || product.brand,
        location: location || product.location,
        image: imageUrl,
        gallery: galleryUrls
      };

      const updatedProduct = await Product.findOneAndUpdate(filter, updateData, { new: true }).populate("category");

      // Forensic Signal
      await AuditService.log(
        tenantId,
        req.user._id,
        AuditAction.ASSET_UPDATED,
        `Asset Configuration Reallocated: ${product.name}`,
        { productId: id, changes: Object.keys(req.body) }
      );

      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ success: false, message });
    }
  };

  static syncProducts = async (req: any, res: Response) => {
    try {
      const { products } = req.body;
      const { tenantId } = req.user;

      if (!tenantId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "User is not associated with a tenant.",
          });
      }

      if (products && Array.isArray(products)) {
        const operations = products.map((prod: any) => ({
          updateOne: {
            filter: { sku: prod.sku, tenantId },
            update: { ...prod, tenantId },
            upsert: true,
          },
        }));
        await Product.bulkWrite(operations);
      }

      res
        .status(200)
        .json({ success: true, message: "Synchronisation réussie" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ success: false, message });
    }
  };

  static delete = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { role, tenantId } = req.user;
      const filter =
        role === UserRole.ADMIN
          ? { _id: id }
          : { _id: id, tenantId: tenantId };

      const product = await Product.findOneAndDelete(filter);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Produit non trouvé" });

      // Forensic Signal
      await AuditService.log(
        tenantId,
        req.user._id,
        AuditAction.ASSET_DELETED,
        `Asset Permanently Purged: ${product.name} (SKU: ${product.sku})`,
        { productId: id }
      );

      res.status(200).json({ success: true, message: "Produit supprimé" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ success: false, message });
    }
  };

  static getProductStats = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;

      // Real calculation from Orders
      const stats = await mongoose.model("Order").aggregate([
        { $match: { tenantId, "items.productId": new mongoose.Types.ObjectId(id) } },
        { $unwind: "$items" },
        { $match: { "items.productId": new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        }
      ]);

      // Daily trend (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const trend = await mongoose.model("Order").aggregate([
        { 
          $match: { 
            tenantId, 
            "items.productId": new mongoose.Types.ObjectId(id),
            createdAt: { $gte: weekAgo }
          } 
        },
        { $unwind: "$items" },
        { $match: { "items.productId": new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            qty: { $sum: "$items.quantity" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      res.json({
        success: true,
        data: {
          summary: stats[0] || { totalSold: 0, totalRevenue: 0 },
          trend: trend.map(t => ({ date: t._id, amount: t.qty }))
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static addComment = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const { name: userName, _id: userId } = req.user;

      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: "Asset not found" });

      product.internalComments.push({
        userId,
        userName,
        text,
        date: new Date()
      });

      await product.save();
      res.status(201).json({ success: true, data: product.internalComments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
