import mongoose, { Schema, Document } from "mongoose";

export interface ISupplierTransaction extends Document {
  supplierId: mongoose.Types.ObjectId;
  tenantId: string;
  type: "INVOICE" | "PAYMENT" | "CREDIT_NOTE" | "DEBIT_NOTE";
  amount: number;
  currency: string;
  date: Date;
  dueDate?: Date;
  reference: string; // Numéro de pièce Oracle-style
  description?: string;
  approvalStatus: "DRAFT" | "PENDING" | "APPROVED"; // Workflow de validation
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  paymentMethod?: "CASH" | "CHEQUE" | "TRANSFER" | "OTHER";
  chequeDetails?: {
    number?: string;
    bank?: string;
    date?: Date;
  };
  documentUrl?: string;
  tags: string[];
  metadata: any;
}

const SupplierTransactionSchema: Schema = new Schema(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      enum: ["INVOICE", "PAYMENT", "CREDIT_NOTE", "DEBIT_NOTE"], 
      required: true 
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "MAD" },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
    reference: { type: String, required: true },
    description: { type: String },
    approvalStatus: { 
      type: String, 
      enum: ["DRAFT", "PENDING", "APPROVED"], 
      default: "APPROVED" 
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID"
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CHEQUE", "TRANSFER", "OTHER"],
    },
    chequeDetails: {
      number: String,
      bank: String,
      date: Date,
    },
    documentUrl: { type: String },
    tags: { type: [String] },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true },
);

export default mongoose.models.SupplierTransaction ||
  mongoose.model<ISupplierTransaction>("SupplierTransaction", SupplierTransactionSchema);
