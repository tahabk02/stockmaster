import mongoose, { Schema, Document } from "mongoose";

export enum ReturnStatus {
  PENDING = "PENDING",
  INSPECTING = "INSPECTING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED"
}

export enum ReturnType {
  CUSTOMER_TO_VENDOR = "CUSTOMER_TO_VENDOR",
  VENDOR_TO_SUPPLIER = "VENDOR_TO_SUPPLIER"
}

export interface IReturn extends Document {
  tenantId: string;
  orderId?: mongoose.Types.ObjectId; // If from customer
  purchaseId?: mongoose.Types.ObjectId; // If to supplier
  type: ReturnType;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    reason: string;
    condition: "NEW" | "OPENED" | "DAMAGED" | "DEFECTIVE";
  }[];
  status: ReturnStatus;
  actionTaken?: "REFUND" | "REPLACEMENT" | "REPAIR" | "RESTOCK";
  notes?: string;
  refundAmount?: number;
  createdAt: Date;
}

const ReturnSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  purchaseId: { type: Schema.Types.ObjectId, ref: "Purchase" },
  type: { type: String, enum: Object.values(ReturnType), required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    condition: { type: String, enum: ["NEW", "OPENED", "DAMAGED", "DEFECTIVE"], default: "OPENED" }
  }],
  status: { type: String, enum: Object.values(ReturnStatus), default: ReturnStatus.PENDING },
  actionTaken: { type: String, enum: ["REFUND", "REPLACEMENT", "REPAIR", "RESTOCK"] },
  notes: { type: String },
  refundAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Return || mongoose.model<IReturn>("Return", ReturnSchema);
