import mongoose, { Schema, Document } from "mongoose";

export interface IMarketingCampaign extends Document {
  tenantId: string;
  name: string;
  type: "DISCOUNT" | "PROMOTION" | "BLACK_FRIDAY" | "CLEARANCE";
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  startDate: Date;
  endDate: Date;
  budget?: number;
  discountPercentage?: number;
  products: mongoose.Types.ObjectId[];
  reach: number;
  conversions: number;
  createdAt: Date;
}

const MarketingCampaignSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["DISCOUNT", "PROMOTION", "BLACK_FRIDAY", "CLEARANCE"], default: "PROMOTION" },
  status: { type: String, enum: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"], default: "DRAFT" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  reach: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.MarketingCampaign || mongoose.model<IMarketingCampaign>("MarketingCampaign", MarketingCampaignSchema);
