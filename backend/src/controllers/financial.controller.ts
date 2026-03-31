import { Response } from "express";
import FinancialMetric from "../models/FinancialMetric";
import Order from "../models/Order";
import Product from "../models/Product";
import mongoose from "mongoose";

export class FinancialController {
  
  static syncCurrentMonth = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const now = new Date();
      const period = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const orders = await Order.find({
        tenantId,
        createdAt: { $gte: startOfMonth },
        status: { $ne: "CANCELLED" }
      });

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const estimatedCOGS = totalRevenue * 0.4; 
      const estimatedExpenses = totalRevenue * 0.15;
      const taxRate = 0.20;

      const netProfit = totalRevenue - estimatedCOGS - estimatedExpenses;
      const taxAmount = netProfit > 0 ? netProfit * taxRate : 0;

      const metric = await FinancialMetric.findOneAndUpdate(
        { tenantId, period },
        { 
          revenue: totalRevenue,
          costOfGoodsSold: estimatedCOGS,
          operatingExpenses: estimatedExpenses,
          netProfit: netProfit - taxAmount,
          taxAmount,
          isClosed: false
        },
        { upsert: true, new: true }
      );

      // --- ADVANCED DIAGNOSTICS ---
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevPeriod = `${prevMonth.getFullYear()}-${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      const prevMetric = await FinancialMetric.findOne({ tenantId, period: prevPeriod });

      const diagnostics = {
        growth: prevMetric ? ((totalRevenue - prevMetric.revenue) / prevMetric.revenue) * 100 : 0,
        margin: totalRevenue > 0 ? ((netProfit - taxAmount) / totalRevenue) * 100 : 0,
        efficiencyScore: Math.min(100, Math.max(0, (netProfit / (estimatedCOGS + estimatedExpenses || 1)) * 50)),
        status: totalRevenue > (prevMetric?.revenue || 0) ? "OPTIMIZING" : "STAGNANT"
      };

      res.status(200).json({ success: true, data: { ...metric.toObject(), diagnostics } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getHistory = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const metrics = await FinancialMetric.find({ tenantId }).sort({ period: -1 }).limit(12);
      
      // Calculate more trends for the frontend diagnostic
      const trends = metrics.map((m, i) => {
        const next = metrics[i + 1];
        return {
          ...m.toObject(),
          revenueGrowth: next ? ((m.revenue - next.revenue) / next.revenue) * 100 : 0,
          profitMargin: m.revenue > 0 ? (m.netProfit / m.revenue) * 100 : 0
        };
      });

      res.json({ success: true, data: trends });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
