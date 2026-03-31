import { Response } from "express";
import Contract from "../models/Contract";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export class ContractController {
  static create = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const contract = await Contract.create({ ...req.body, tenantId });
    res.status(201).json({ success: true, data: contract });
  });

  static getAll = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const contracts = await Contract.find({ tenantId })
      .populate("entityId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: contracts });
  });

  static getStats = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const stats = await Contract.aggregate([
      { $match: { tenantId } },
      { $group: { 
        _id: "$status", 
        count: { $sum: 1 }, 
        totalValue: { $sum: "$value" } 
      }}
    ]);
    res.json({ success: true, data: stats });
  });

  static updateStatus = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;
    const contract = await Contract.findOneAndUpdate({ _id: id, tenantId }, { status }, { new: true });
    if (!contract) throw new AppError("Contract Node not found", 404);
    res.json({ success: true, data: contract });
  });
}
