import mongoose, { Schema, Document } from "mongoose";

export enum ProductionStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface IProductionOrder extends Document {
  tenantId: string;
  formulaId: mongoose.Types.ObjectId;
  quantity: number;
  status: ProductionStatus;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
}

const ProductionOrderSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  formulaId: { type: Schema.Types.ObjectId, ref: "Formula", required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: Object.values(ProductionStatus), default: ProductionStatus.PLANNED },
  startedAt: { type: Date },
  completedAt: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ProductionOrder || mongoose.model<IProductionOrder>("ProductionOrder", ProductionOrderSchema);
