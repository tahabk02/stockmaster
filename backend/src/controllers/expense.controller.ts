import { Request, Response } from "express";
import Expense from "../models/Expense";
import { Tenant } from "../models/Tenant";
import { catchAsync } from "../utils/catchAsync";
import { PDFGenerator } from "../utils/pdfGen";

export class ExpenseController {
  static downloadReceipt = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;

    const expense = await Expense.findOne({ _id: id, tenantId });
    if (!expense) return res.status(404).json({ message: "Signal not found" });

    const tenant = await Tenant.findOne({ slug: tenantId });
    const buffer = await PDFGenerator.generateExpenseReceipt(expense, tenant);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Receipt-${id.slice(-6)}.pdf`);
    res.send(buffer);
  });

  static create = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const expense = await Expense.create({ ...req.body, tenantId });
    res.status(201).json({ success: true, data: expense });
  });

  static getAll = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const { category, startDate, endDate } = req.query;
    
    let filter: any = { tenantId };
    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  });

  static getStats = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const stats = await Expense.aggregate([
      { $match: { tenantId } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);
    res.json({ success: true, data: stats });
  });

  static delete = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;
    await Expense.findOneAndDelete({ _id: id, tenantId });
    res.json({ success: true, message: "Fiscal Signal Purged" });
  });
}
