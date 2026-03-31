import { Response } from "express";
import QualityCheck from "../models/QualityCheck";
import { catchAsync } from "../utils/catchAsync";

export class QualityController {
  static record = catchAsync(async (req: any, res: Response) => {
    const { tenantId, _id: inspectorId } = req.user;
    const check = await QualityCheck.create({ ...req.body, tenantId, inspectorId });
    res.status(201).json({ success: true, data: check });
  });

  static getHistory = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const checks = await QualityCheck.find({ tenantId })
      .populate("productId", "name category image")
      .populate("inspectorId", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: checks });
  });

  static getProductInsights = catchAsync(async (req: any, res: Response) => {
    const { id: productId } = req.params;
    const { tenantId } = req.user;
    const stats = await QualityCheck.aggregate([
      { $match: { productId, tenantId } },
      { $group: {
        _id: "$status",
        avgScore: { $avg: "$score" },
        count: { $sum: 1 }
      }}
    ]);
    res.json({ success: true, data: stats });
  });
}
