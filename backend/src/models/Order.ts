import mongoose, { Schema, Document } from "mongoose";
import { OrderStatus } from "../enums/OrderStatus";

export interface IOrder extends Document {
  receiptNumber: string;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalPrice: number;
  paymentMethod: "CASH" | "CARD" | "CHEQUE" | "TRANSFER" | "PROMISSORY_NOTE";
  transactionId?: string; // المرجع من Stripe
  amountReceived: number;
  change: number;
  status: string;
  tenantId: string;
  userId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  type: "SALE" | "RETURN" | "QUOTE";
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  receiptNumber: { type: String, required: true, unique: true, index: true },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  subTotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["CASH", "CARD", "CHEQUE", "TRANSFER", "PROMISSORY_NOTE"], required: true },
  transactionId: { type: String }, // لتخزين رقم العملية البنكية
  amountReceived: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CONFIRMED,
  },
  tenantId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  type: { 
    type: String, 
    enum: ["SALE", "RETURN", "QUOTE"], 
    default: "SALE" 
  },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
