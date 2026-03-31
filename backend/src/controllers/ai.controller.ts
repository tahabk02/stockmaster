import { Request, Response } from "express";
import { AIService } from "../services/ai.service";
import Product from "../models/Product";

export const diagnoseProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const lang = (req.headers['accept-language'] as 'en' | 'fr' | 'ar') || 'en';
    
    if (!productId) return res.status(400).json({ message: "Product ID requis" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const diagnosis = await AIService.generateDiagnostic(product, lang);
    res.status(200).json(diagnosis);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur analyse IA", error: error.message });
  }
};

export const chat = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const lang = (req.headers['accept-language'] as 'en' | 'fr' | 'ar') || 'en';
    
    const response = await AIService.processNeuralQuery(query, lang);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: "Neural Link Error", error: error.message });
  }
};

export const vision = async (req: Request, res: Response) => {
  try {
    const { image } = req.body; 
    const result = await AIService.analyzeVisualNode(image);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Vision Error", error: error.message });
  }
};

export const getInsights = async (req: any, res: Response) => {
  try {
    const { tenantId } = req.user as any;
    const insights = await AIService.getGlobalInsights(tenantId);
    res.status(200).json(insights);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur insights IA", error: error.message });
  }
};

export const getSupplyChainStatus = async (req: any, res: Response) => {
  try {
    const { tenantId } = req.user as any;
    const data = await AIService.optimizeSupplyChain(tenantId);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur Supply Chain IA", error: error.message });
  }
};
