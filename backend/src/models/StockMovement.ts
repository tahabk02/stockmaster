// backend/src/models/StockMovement.ts
import mongoose, { Schema, model, Document } from "mongoose";
import { StockType } from "../enums/StockType";

export interface StockMovementDocument extends Document {
  tenantId: string;
  productId: string;
  type: StockType;
  quantity: number;
  reason?: string; 
  referenceType?: 'Order' | 'Purchase' | 'Adjustment' | 'Transfer';
  referenceId?: string; // ObjectId of the related document
  batchNumber?: string;
  expiryDate?: Date;
}

const stockMovementSchema = new Schema<StockMovementDocument>(
  {
    // حولته لـ String ليتوافق مع بقية الموديلات عندك
    tenantId: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId as any, ref: "Product", required: true },
    type: { type: String, enum: Object.values(StockType), required: true },
    quantity: { type: Number, required: true },
    reason: { type: String },
    referenceType: { 
      type: String, 
      enum: ['Order', 'Purchase', 'Adjustment', 'Transfer'] 
    },
    referenceId: { type: String },
    batchNumber: { type: String },
    expiryDate: { type: Date },
  },
  { timestamps: true },
);

export const StockMovement = mongoose.models.StockMovement || model<StockMovementDocument>(
  "StockMovement",
  stockMovementSchema,
);
