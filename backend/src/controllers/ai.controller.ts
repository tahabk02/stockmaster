import { Request, Response } from "express";
import { AIService } from "../services/ai.service";
import Product from "../models/Product";

export const AIController = {
  diagnoseProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const lang = (req.headers['accept-language'] as 'en' | 'fr' | 'ar') || 'en';
      
      const product = await Product.findById(productId).populate("category");
      if (!product) return res.status(404).json({ message: "Asset not found" });

      const diagnosis = await AIService.generateDiagnostic(product, lang);
      res.status(200).json({ success: true, data: diagnosis });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Diagnostic Error", error: error.message });
    }
  },

  chat: async (req: any, res: Response) => {
    try {
      const { query } = req.body;
      const { tenantId } = req.user;
      const lang = (req.headers['accept-language'] as 'en' | 'fr' | 'ar') || 'en';
      
      const lowStock = await Product.find({ tenantId, quantity: { $lt: 10 } }).limit(5);
      
      const response = await AIService.processNeuralQuery(query, { lowStockCount: lowStock.length, lowStockItems: lowStock.map(p => p.name) }, lang);
      res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Neural Link Error", error: error.message });
    }
  },

  getInsights: async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const products = await Product.find({ tenantId }).lean();
      
      const insights = await AIService.getGlobalInsights({ productCount: products.length, totalStockValue: products.reduce((acc, p) => acc + (p.price * p.quantity), 0) });
      res.status(200).json({ success: true, data: insights });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Insight Error", error: error.message });
    }
  }
};
