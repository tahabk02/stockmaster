import { Request, Response } from "express";
import Return, { ReturnStatus } from "../models/Return";
import Product from "../models/Product";
import { catchAsync } from "../utils/catchAsync";
import { AuditService, AuditAction } from "../services/audit.service";

export class ReturnController {
  static createReturn = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const rma = await Return.create({ ...req.body, tenantId });
    
    await AuditService.log(
      tenantId, req.user._id, 
      AuditAction.ASSET_UPDATED, 
      `RMA Protocol Initialized: ${rma._id}`, 
      { rmaId: rma._id }
    );

    res.status(201).json({ success: true, data: rma });
  });

  static getAll = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const returns = await Return.find({ tenantId })
      .populate("items.productId")
      .populate("orderId")
      .populate("purchaseId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  });

  static updateStatus = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { status, actionTaken } = req.body;
    const { tenantId } = req.user;

    const rma = await Return.findOneAndUpdate(
      { _id: id, tenantId },
      { status, actionTaken },
      { new: true }
    );

    // Logic: If status is COMPLETED and action is RESTOCK, update inventory
    if (status === ReturnStatus.COMPLETED && actionTaken === "RESTOCK") {
      for (const item of rma.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
      }
    }

    res.json({ success: true, data: rma });
  });
}
