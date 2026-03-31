import { Response } from "express";
import { StockService } from "../services/stock.service";
import { StockMovement } from "../models/StockMovement";
import { StockType } from "../enums/StockType";
import { AuditService, AuditAction } from "../services/audit.service";

export class StockController {
  static adjust = async (req: any, res: Response) => {
    try {
      const { productId, quantity, type, reason, referenceType, referenceId } = req.body;
      const { _id: userId, tenantId } = req.user;

      if (!productId || !quantity || !type) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const product = await StockService.adjustStock(
        productId,
        Number(quantity),
        type as StockType,
        userId,
        tenantId,
        { reason, referenceType, referenceId }
      );

      // Forensic Signal
      await AuditService.log(
        tenantId,
        userId,
        AuditAction.ASSET_UPDATED,
        `Manual Stock Adjustment: ${product.name} (${type === 'IN' ? '+' : '-'}${quantity})`,
        { productId, type, quantity, reason }
      );

      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getMovements = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { productId } = req.query;

      const filter: any = { tenantId };
      if (productId) filter.productId = productId;

      const movements = await StockMovement.find(filter)
        .populate("productId", "name sku image")
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json({ success: true, data: movements });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getStockValue = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const movements = await StockMovement.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: "$type",
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]);

      res.status(200).json({ success: true, data: movements });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
