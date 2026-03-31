import { Response } from "express";
import Formula from "../models/Formula";
import ProductionOrder, { ProductionStatus } from "../models/ProductionOrder";
import Product from "../models/Product";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export class ProductionController {
  
  static createFormula = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const formula = await Formula.create({ ...req.body, tenantId });
    res.status(201).json({ success: true, data: formula });
  });

  static getFormulas = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const formulas = await Formula.find({ tenantId, isActive: true }).populate("finishedProductId");
    res.json({ success: true, data: formulas });
  });

  static createOrder = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const { formulaId, quantity } = req.body;

    // Verify component availability
    const formula = await Formula.findById(formulaId);
    if (!formula) throw new AppError("Formula not found", 404);

    for (const comp of formula.components) {
      const p = await Product.findById(comp.productId);
      if (!p || p.quantity < (comp.quantity * quantity)) {
        throw new AppError(`Insufficient component stock: ${p?.name || 'Unknown'}`, 400);
      }
    }

    const order = await ProductionOrder.create({
      tenantId, formulaId, quantity, status: ProductionStatus.PLANNED
    });

    res.status(201).json({ success: true, data: order });
  });

  static completeOrder = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;

    const order = await ProductionOrder.findOne({ _id: id, tenantId }).populate("formulaId");
    if (!order || order.status === ProductionStatus.COMPLETED) {
      throw new AppError("Order cannot be completed", 400);
    }

    const formula: any = order.formulaId;

    // Deduct components
    for (const comp of formula.components) {
      await Product.findByIdAndUpdate(comp.productId, { 
        $inc: { quantity: -(comp.quantity * order.quantity) } 
      });
    }

    // Add finished product
    await Product.findByIdAndUpdate(formula.finishedProductId, { 
      $inc: { quantity: order.quantity } 
    });

    order.status = ProductionStatus.COMPLETED;
    order.completedAt = new Date();
    await order.save();

    res.json({ success: true, data: order });
  });

  static getOrders = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const orders = await ProductionOrder.find({ tenantId })
      .populate({ path: 'formulaId', populate: { path: 'finishedProductId' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  });
}
