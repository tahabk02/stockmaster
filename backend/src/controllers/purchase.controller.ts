import { Response } from "express";
import Purchase from "../models/Purchase";
import Product from "../models/Product";
import Supplier from "../models/Supplier";
import SupplierTransaction from "../models/SupplierTransaction";
import { StockMovement } from "../models/StockMovement";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";

export class PurchaseController {
  static create = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const { supplierId, items, totalAmount, notes, reference } = req.body;

    // 1. Create Purchase Record
    const purchase = await Purchase.create({
      tenantId,
      supplierId,
      items,
      totalAmount,
      notes,
      reference: reference || `PUR-${Date.now()}`
    });

    // 2. Logic: Process each asset entry into inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue; // Skip if not found, or throw error

      // Update Stock
      product.quantity += item.quantity;
      await product.save();

      // Record Movement Node
      await StockMovement.create({
        productId: product._id,
        tenantId,
        type: "IN",
        quantity: item.quantity,
        reason: "PURCHASE",
        reference: purchase.reference
      });
    }

    // 3. Create Supplier Transaction (The Financial Event)
    await SupplierTransaction.create({
      supplierId,
      tenantId,
      type: "INVOICE",
      amount: totalAmount,
      reference: purchase.reference,
      description: `Procurement: ${purchase.reference}`,
      date: new Date(),
      paymentStatus: "UNPAID",
      approvalStatus: "APPROVED"
    });

    // 4. Update Supplier Global Exposure
    const supplier = await Supplier.findById(supplierId);
    if (supplier) {
      supplier.totalDebt += totalAmount;
      await supplier.save();
    }

    res.status(201).json({ success: true, data: purchase });
  });

  static getAll = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const purchases = await Purchase.find({ tenantId })
      .populate("supplierId", "name contactPerson")
      .populate("items.productId", "name sku image")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: purchases });
  });

  static getById = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;
    const purchase = await Purchase.findOne({ _id: id, tenantId })
      .populate("supplierId")
      .populate("items.productId");

    if (!purchase) throw new AppError("Procurement record not found", 404);
    res.json({ success: true, data: purchase });
  });

  static getBySupplier = catchAsync(async (req: any, res: Response) => {
    const { supplierId } = req.params;
    const { tenantId } = req.user;
    const purchases = await Purchase.find({ supplierId, tenantId })
      .populate("items.productId", "name sku image")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: purchases });
  });
}
