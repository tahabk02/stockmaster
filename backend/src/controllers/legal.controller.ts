import { Request, Response } from "express";
import { AIService } from "../services/ai.service";
import { catchAsync } from "../utils/catchAsync";
import { Tenant } from "../models/Tenant";
import Order from "../models/Order";
import { AppError } from "../utils/AppError";

export class LegalController {
  
  /**
   * NEURAL LEGAL ADVISOR (Gemini Integration)
   */
  static askConsultant = catchAsync(async (req: any, res: Response) => {
    const { query } = req.body;
    const lang = (req.headers['accept-language'] as 'en' | 'fr' | 'ar') || 'fr';
    
    if (!query) throw new AppError("Legal query required", 400);

    const prompt = `
      CONTEXT: You are "StockMaster Legal & Tax Overlord", the most advanced Moroccan Legal & Tax AI.
      JURISDICTION: Kingdom of Morocco (Code Général des Impôts - CGI, Code de Commerce, Code du Travail).
      
      CORE EXPERTISE (HARD KNOWLEDGE):
      1. TVA (Dahir n° 1-05-210): Detailed regimes (Exoneration with/without right to deduct).
      2. Taxe Professionnelle (TP): Rules for new businesses (5-year exemption).
      3. Invoicing (Art 145 of CGI): ICE (15 digits), IF, RC, CNSS, Capital Social.
      4. Cash Limitation (Art 193 of CGI): 10,000 MAD/day/supplier and 100,000 MAD/month limit.
      5. Payroll: CNSS (rates: 25.86%), AMO, IR on salary (progressive scale).
      6. SARL/Auto-Entrepreneur: Legal structures and ceilings (500k/200k for AE).

      USER QUERY: ${query}
      
      LANGUAGE INSTRUCTIONS:
      - If requested in Arabic or Darija: Respond in high-quality Moroccan Darija using Latin script (e.g., "Smiya dyal l'entreprise dialk") or Arabic script as appropriate.
      - If French: Use formal Moroccan administrative French.
      - If English: Professional legal English.

      TONE: Hard, precise, authoritative, "Ultra Pro". No fluff. Direct articles if possible.
      
      OUTPUT FORMAT:
      1. Summary of the law.
      2. Actionable steps for the Vendor.
      3. Potential risks/penalties.
      4. DISCLAMER: Verifier avec un comptable agréé (Moroccan Chartered Accountant).
    `;

    try {
      const response = await AIService.processNeuralQuery(prompt, lang);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({ message: "Legal Link Error", error: error.message });
    }
  });

  /**
   * LEGAL HEALTH HUD (Diagnostic)
   */
  static getLegalHealth = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;

    const tenant = await Tenant.findOne({ slug: tenantId });
    if (!tenant) throw new AppError("Tenant Node Compromised", 404);

    const alerts = [];
    let score = 100;

    // 1. Fiscal Identity Check
    if (!tenant.taxId) {
       alerts.push({ id: "MISSING_IF", type: "CRITICAL", title: "IDENTIFIANT FISCAL (IF) MISSING", message: "Violation of Art 145 of CGI. High audit risk." });
       score -= 30;
    }
    if (!tenant.vatNumber) {
       alerts.push({ id: "MISSING_ICE", type: "CRITICAL", title: "ICE (15 DIGITS) NOT DETECTED", message: "Mandatory for all B2B transactions in Morocco since 2016." });
       score -= 30;
    }

    // 2. Calendar-Based Tax Alerts
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;

    // TVA Deadline (20th of each month)
    if (day >= 10 && day <= 20) {
      alerts.push({ id: "TVA_DEADLINE", type: "URGENT", title: "TVA DECLARATION WINDOW", message: `Deadline: 20/${month}. Ensure all purchases have valid ICE.` });
    }

    // IR/CNSS Deadline (10th of each month)
    if (day >= 1 && day <= 10) {
      alerts.push({ id: "SOCIAL_DEADLINE", type: "URGENT", title: "CNSS/IR SALARY DUE", message: `Social declarations must be submitted before the 10th.` });
    }

    // Annual TP/Tax check (January/March)
    if (month === 1) {
      alerts.push({ id: "TAXE_PROF", type: "INFO", title: "TAXE PROFESSIONNELLE", message: "Review your TP exemptions for this fiscal year." });
    }

    res.json({
      score,
      status: score > 70 ? "SECURE" : score > 40 ? "VULNERABLE" : "EXPOSED",
      alerts,
      jurisdiction: "MOROCCO_FISCAL_v2026",
      timestamp: new Date()
    });
  });
}
