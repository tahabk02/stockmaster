import { Request, Response } from "express";
import Document from "../models/Document";
import { catchAsync } from "../utils/catchAsync";

export class DocumentController {
  static create = catchAsync(async (req: any, res: Response) => {
    const { tenantId, _id: userId } = req.user;
    const doc = await Document.create({ ...req.body, tenantId, createdBy: userId });
    res.status(201).json({ success: true, data: doc });
  });

  static getAll = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const docs = await Document.find({ tenantId }).sort({ title: 1 });
    res.json({ success: true, data: docs });
  });

  static delete = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;
    await Document.findOneAndDelete({ _id: id, tenantId });
    res.json({ success: true, message: "Document Purged" });
  });
}
