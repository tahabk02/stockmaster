import { Response } from "express";
import WarehouseLayout from "../models/WarehouseLayout";
import Product from "../models/Product";
import Order from "../models/Order";
import Supplier from "../models/Supplier";
import mongoose from "mongoose";
import Delivery, { DeliveryStatus } from "../models/Delivery";

export class LogisticsController {
  
  // --- DELIVERY FLEET METHODS ---

  static getAllDeliveries = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const deliveries = await Delivery.find({ tenantId })
        .populate("orderId")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: deliveries });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static createDelivery = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { orderId, carrierName, priority, destination, notes } = req.body;

      const trackingNumber = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const newDelivery = await Delivery.create({
        tenantId,
        orderId,
        carrierName,
        trackingNumber,
        priority,
        destination,
        notes,
        estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Default 3 days
      });

      res.status(201).json({ success: true, data: newDelivery });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static updateDeliveryStatus = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { tenantId } = req.user;

      const delivery = await Delivery.findOneAndUpdate(
        { _id: id, tenantId },
        { status, actualArrival: status === "DELIVERED" ? new Date() : undefined },
        { new: true }
      );

      if (!delivery) return res.status(404).json({ message: "Delivery node not found" });
      res.json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- WAREHOUSE LAYOUT METHODS ---
  static saveLayout = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { grid, dimensions, name } = req.body;

      if (!tenantId) throw new Error("Tenant ID missing in request");

      const layout = await WarehouseLayout.findOneAndUpdate(
        { tenantId },
        { grid, dimensions, name },
        { upsert: true, new: true }
      );

      res.status(200).json({ success: true, data: layout });
    } catch (error: any) {
      console.error("[Logistics] Save Layout Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Récupérer le plan actuel
  static getLayout = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      if (!tenantId) throw new Error("Tenant ID missing in request");

      const layout = await WarehouseLayout.findOne({ tenantId });
      res.status(200).json({ success: true, data: layout });
    } catch (error: any) {
      console.error("[Logistics] Get Layout Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * NEURAL RESTOCK ENGINE
   */
  static getRestockSuggestions = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      if (!tenantId) throw new Error("Tenant ID missing in request");
      
      // 1. Récupérer tous les produits
      const products = await Product.find({ tenantId }).populate("supplierId").lean();
      
      // 2. Récupérer les commandes des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const orders = await Order.find({ 
        tenantId, 
        createdAt: { $gte: thirtyDaysAgo },
        status: { $ne: "CANCELLED" }
      }).lean();

      const suggestions = products.map((product: any) => {
        const productIdStr = product._id?.toString();
        if (!productIdStr) return null;

        // Calculer combien d'unités vendues par jour
        const totalSold = orders.reduce((sum, order: any) => {
          if (!order || !order.items || !Array.isArray(order.items)) return sum;
          
          const item = order.items.find((i: any) => 
            i && i.productId && i.productId.toString() === productIdStr
          );
          
          return sum + (item?.quantity || 0);
        }, 0);

        const velocity = totalSold / 30; 
        const leadTime = 5; 
        
        const safetyStock = Math.ceil(velocity * leadTime * 1.5);
        const threshold = Math.max(safetyStock, product.minStockThreshold || 10);
        const isCritical = product.quantity <= threshold;
        
        const targetInventory = Math.ceil(velocity * 30) + threshold;
        const suggestedOrder = isCritical ? Math.max(0, targetInventory - product.quantity) : 0;

        return {
          id: productIdStr,
          name: product.name,
          sku: product.sku,
          current: product.quantity,
          velocity: velocity > 2 ? "High" : velocity > 0.5 ? "Medium" : "Low",
          suggested: suggestedOrder,
          supplier: product.supplierId?.name || "No Supplier",
          isCritical
        };
      }).filter((s: any) => s !== null && (s.isCritical || s.suggested > 0));

      res.status(200).json({ success: true, data: suggestions });
    } catch (error: any) {
      console.error("[Logistics] Restock Suggestion Error:", error);
      res.status(500).json({ success: false, message: "Neural Engine Error: " + error.message });
    }
  };
}
