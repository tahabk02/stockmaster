import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  tenantId: string;
  category: "RENT" | "SALARY" | "UTILITY" | "MARKETING" | "MAINTENANCE" | "TAX" | "OTHER";
  amount: number;
  description: string;
  payee?: string;
  date: Date;
  status: "PENDING" | "PAID";
  paymentMethod?: string;
  attachments?: string[];
  createdAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  category: { type: String, enum: ["RENT", "SALARY", "UTILITY", "MARKETING", "MAINTENANCE", "TAX", "OTHER"], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  payee: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["PENDING", "PAID"], default: "PAID" },
  paymentMethod: { type: String },
  attachments: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
