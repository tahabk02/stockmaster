import { Response } from "express";
import { AIService } from "../services/ai.service";
import { catchAsync } from "../utils/catchAsync";
import { Tenant } from "../models/Tenant";
import { AppError } from "../utils/AppError";

export class LegalController {
  /**
   * NEURAL LEGAL ADVISOR (Gemini Integration)
   */
  static askConsultant = catchAsync(async (req: any, res: Response) => {
    const { query } = req.body;
    const lang = (req.headers["accept-language"] as "en" | "fr" | "ar") || "fr";

    if (!query) throw new AppError("Legal query required", 400);

    try {
      const response = await AIService.processLegalQuery(query, lang);
      res.status(200).json(response);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Legal Link Error", error: error.message });
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
      alerts.push({
        id: "MISSING_IF",
        type: "CRITICAL",
        title: "IDENTIFIANT FISCAL (IF) MISSING",
        message: "Violation of Art 145 of CGI. High audit risk.",
      });
      score -= 30;
    }
    if (!tenant.vatNumber) {
      alerts.push({
        id: "MISSING_ICE",
        type: "CRITICAL",
        title: "ICE (15 DIGITS) NOT DETECTED",
        message: "Mandatory for all B2B transactions in Morocco since 2016.",
      });
      score -= 30;
    }

    // 2. Calendar-Based Tax Alerts
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;

    // TVA Deadline (20th of each month)
    if (day >= 10 && day <= 20) {
      alerts.push({
        id: "TVA_DEADLINE",
        type: "URGENT",
        title: "TVA DECLARATION WINDOW",
        message: `Deadline: 20/${month}. Ensure all purchases have valid ICE.`,
      });
    }

    // IR/CNSS Deadline (10th of each month)
    if (day >= 1 && day <= 10) {
      alerts.push({
        id: "SOCIAL_DEADLINE",
        type: "URGENT",
        title: "CNSS/IR SALARY DUE",
        message: `Social declarations must be submitted before the 10th.`,
      });
    }

    // Annual TP/Tax check (January/March)
    if (month === 1) {
      alerts.push({
        id: "TAXE_PROF",
        type: "INFO",
        title: "TAXE PROFESSIONNELLE",
        message: "Review your TP exemptions for this fiscal year.",
      });
    }

    res.json({
      score,
      status: score > 70 ? "SECURE" : score > 40 ? "VULNERABLE" : "EXPOSED",
      alerts,
      jurisdiction: "MOROCCO_FISCAL_v2026",
      timestamp: new Date(),
    });
  });
}
