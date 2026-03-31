import { Request, Response } from "express";
import Product from "../models/Product";
import { StockMovement } from "../models/StockMovement";
import Order from "../models/Order";
import SupplierTransaction from "../models/SupplierTransaction";
import mongoose from "mongoose";

import { AIService } from "../services/ai.service";

export const reportController = {
  getGlobalStats: async (req: any, res: Response) => {
    try {
      const { tenantId, role } = req.user;
      const matchQuery = (role === "ADMIN" || role === "SUPER_ADMIN") ? {} : { tenantId };

      // 1. Basic Stats
      const productStats = await Product.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
            totalItems: { $sum: "$quantity" },
            lowStockItems: {
              $sum: { $cond: [{ $lte: ["$quantity", "$minStockThreshold"] }, 1, 0] },
            },
          },
        },
      ]);

      // 2. Financial Stats (Revenue vs Purchases)
      const salesStats = await Order.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, orderCount: { $sum: 1 } } }
      ]);

      const purchaseStats = await SupplierTransaction.aggregate([
        { $match: { ...matchQuery, type: "INVOICE" } },
        { $group: { _id: null, totalPurchases: { $sum: "$amount" } } }
      ]);

      // 3. Chart Data (Last 30 Days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySales = await Order.aggregate([
        { $match: { ...matchQuery, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dailyPurchases = await SupplierTransaction.aggregate([
        { $match: { ...matchQuery, type: "INVOICE", date: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            cost: { $sum: "$amount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Merge daily data for chart
      const chartMap: Record<string, any> = {};
      dailySales.forEach(d => chartMap[d._id] = { date: d._id, revenue: d.revenue, cost: 0 });
      dailyPurchases.forEach(d => {
        if (chartMap[d._id]) chartMap[d._id].cost = d.cost;
        else chartMap[d._id] = { date: d._id, revenue: 0, cost: d.cost };
      });

      const chartData = Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));

      // 4. Category Distribution
      const categoryStats = await Product.aggregate([
        { $match: matchQuery },
        { 
          $group: { 
            _id: "$category", 
            count: { $sum: 1 }, 
            value: { $sum: { $multiply: ["$price", "$quantity"] } } 
          } 
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
            count: 1,
            value: 1
          }
        },
        { $sort: { value: -1 } },
        { $limit: 5 }
      ]);

      // 5. Recent Movements
      const recentMovements = await StockMovement.find(matchQuery)
        .populate("productId", "name sku")
        .sort({ createdAt: -1 })
        .limit(8);

      // 6. Top Selling Products
      const topProducts = await Order.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: { $ifNull: ["$productInfo.name", "Unknown Product"] },
            image: "$productInfo.image",
            totalSold: 1,
            revenue: 1
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]);

      // 7. OPERATIONAL HEALTH METRICS (SaaS Excellence)
      const avgInventoryValue = (productStats[0]?.totalStockValue || 0) / 2; // Simplified
      const costOfGoodsSold = (purchaseStats[0]?.totalPurchases || 0);
      const inventoryTurnover = avgInventoryValue > 0 ? (costOfGoodsSold / avgInventoryValue) : 0;
      const stockToSalesRatio = (salesStats[0]?.totalRevenue || 0) > 0 
        ? (productStats[0]?.totalStockValue / salesStats[0]?.totalRevenue) 
        : 0;

      // 8. REAL AI INSIGHTS FROM AI SERVICE
      const aiResponse = await AIService.generateStrategicInsights(tenantId || "MAIN-PLATFORM");
      const aiInsights = aiResponse?.insights || [];

      const finalData = {
        products: productStats[0] || { totalProducts: 0, totalStockValue: 0, totalItems: 0, lowStockItems: 0 },
        finance: {
          revenue: salesStats[0]?.totalRevenue || 0,
          orders: salesStats[0]?.orderCount || 0,
          purchases: purchaseStats[0]?.totalPurchases || 0,
          margin: (salesStats[0]?.totalRevenue || 0) - (purchaseStats[0]?.totalPurchases || 0),
          turnover: Number(inventoryTurnover.toFixed(2)),
          stockSalesRatio: Number(stockToSalesRatio.toFixed(2))
        },
        chartData,
        categoryStats,
        recentMovements,
        topProducts,
        aiInsights
      };

      res.status(200).json({ success: true, data: finalData });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  chatWithAI: async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { query } = req.body;
      
      const response = await AIService.processChatQuery(tenantId || "MAIN-PLATFORM", query);
      
      res.status(200).json({ success: true, response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCategoryDistribution: async (req: any, res: Response) => {
    try {
      const { tenantId, role } = req.user;
      const matchQuery = (role === "ADMIN" || role === "SUPER_ADMIN") ? {} : { tenantId };
      const distribution = await Product.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);
      res.status(200).json({ success: true, data: distribution });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  exportData: async (req: any, res: Response) => {
    try {
      const { tenantId, role } = req.user;
      const matchQuery = (role === "ADMIN" || role === "SUPER_ADMIN") ? {} : { tenantId };

      const products = await Product.find(matchQuery);
      
      // Basic CSV Generation
      let csv = "SKU,Name,Category,Quantity,Price,Value\n";
      products.forEach(p => {
        const row = [
          p.sku,
          `"${p.name.replace(/"/g, '""')}"`,
          p.category,
          p.quantity,
          p.price,
          p.quantity * p.price
        ].join(",");
        csv += row + "\n";
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=stockmaster-export-${Date.now()}.csv`);
      return res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
