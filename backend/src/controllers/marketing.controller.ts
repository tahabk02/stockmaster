import { Request, Response } from "express";
import MarketingCampaign from "../models/MarketingCampaign";
import { catchAsync } from "../utils/catchAsync";

export class MarketingController {
  static createCampaign = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const campaign = await MarketingCampaign.create({ ...req.body, tenantId });
    res.status(201).json({ success: true, data: campaign });
  });

  static getCampaigns = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const campaigns = await MarketingCampaign.find({ tenantId }).sort({ createdAt: -1 });
    res.json({ success: true, data: campaigns });
  });

  static updateStatus = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;
    const campaign = await MarketingCampaign.findOneAndUpdate({ _id: id, tenantId }, { status }, { new: true });
    res.json({ success: true, data: campaign });
  });
}
