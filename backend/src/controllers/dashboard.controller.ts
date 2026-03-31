import { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import { Tenant } from "../models/Tenant";
import User from "../models/User";
import { StockMovement } from "../models/StockMovement";

export const dashboardController = {
  getStats: async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;

      // 1. ASSET METRICS
      const products = await Product.find({ tenantId });
      const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
      const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const lowStockCount = products.filter(p => p.quantity <= (p.minStockThreshold || 5)).length;

      // 2. TRANSACTION METRICS (Last 24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentOrders = await Order.find({ 
        tenantId, 
        createdAt: { $gte: twentyFourHoursAgo } 
      });
      const dailyRevenue = recentOrders.reduce((sum, o) => sum + o.totalPrice, 0);

      // 3. NETWORK STATUS
      const activeUsers = await User.countDocuments({ tenantId, status: 'ACTIVE' });

      // 4. LATEST SIGNAL
      const latestMovement = await StockMovement.findOne({ tenantId })
        .sort({ createdAt: -1 })
        .populate('productId', 'name');

      res.status(200).json({
        success: true,
        data: {
          totalItems,
          totalStockValue,
          lowStockCount,
          dailyRevenue,
          activeUsers,
          latestSignal: latestMovement ? {
            type: latestMovement.type,
            product: latestMovement.productId?.name,
            qty: latestMovement.quantity,
            timestamp: latestMovement.createdAt
          } : null
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "DASHBOARD_SYNC_FAILURE", error: error.message });
    }
  }
};
