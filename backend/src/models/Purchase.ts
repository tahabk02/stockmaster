import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  supplierId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    purchasePrice: number;
  }[];
  totalAmount: number;
  status: string;
  reference: string;
  notes: string;
  tenantId: string;
  createdAt: Date;
}

const PurchaseSchema: Schema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      purchasePrice: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  reference: { type: String, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ["PENDING", "RECEIVED", "CANCELLED"],
    default: "RECEIVED",
  },
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
