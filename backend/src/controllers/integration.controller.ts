import { Response } from "express";
import { Integration, Webhook } from "../models/Integration";
import crypto from "crypto";

export class IntegrationController {
  
  static getIntegrations = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const data = await Integration.find({ tenantId });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static createIntegration = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { provider, config } = req.body;

      // Générer une clé API pro
      const apiKey = `sk_live_${crypto.randomBytes(24).toString("hex")}`;

      const integration = await Integration.create({
        tenantId,
        provider,
        config,
        apiKey,
        status: "ACTIVE"
      });

      res.status(201).json({ success: true, data: integration });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- Webhooks ---
  static getWebhooks = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const data = await Webhook.find({ tenantId });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static createWebhook = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { event, targetUrl } = req.body;
      const secret = `whsec_${crypto.randomBytes(16).toString("hex")}`;

      const webhook = await Webhook.create({
        tenantId, event, targetUrl, secret
      });

      res.status(201).json({ success: true, data: webhook });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
