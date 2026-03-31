import mongoose, { Schema, Document } from "mongoose";

export interface IFinancialMetric extends Document {
  tenantId: string;
  period: string; // YYYY-MM
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  netProfit: number;
  taxAmount: number;
  currency: string;
  isClosed: boolean; // Si le mois est clôturé comptablement
}

const FinancialMetricSchema = new Schema<IFinancialMetric>(
  {
    tenantId: { type: String, required: true, index: true },
    period: { type: String, required: true },
    revenue: { type: Number, default: 0 },
    costOfGoodsSold: { type: Number, default: 0 },
    operatingExpenses: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    currency: { type: String, default: "MAD" },
    isClosed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index unique pour éviter les doublons de périodes
FinancialMetricSchema.index({ tenantId: 1, period: 1 }, { unique: true });

export default mongoose.models.FinancialMetric || 
  mongoose.model<IFinancialMetric>("FinancialMetric", FinancialMetricSchema);
