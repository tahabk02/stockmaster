import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  tenantId: string;
  title: string;
  entityId: mongoose.Types.ObjectId; // Client or Supplier
  entityType: "CLIENT" | "SUPPLIER";
  type: "SUPPLY" | "SLA" | "NDA" | "LEASE" | "EMPLOYMENT";
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";
  value: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  metadata: any;
  createdAt: Date;
}

const ContractSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true, refPath: "entityType" },
  entityType: { type: String, enum: ["CLIENT", "SUPPLIER"], required: true },
  type: { type: String, enum: ["SUPPLY", "SLA", "NDA", "LEASE", "EMPLOYMENT"], default: "SUPPLY" },
  status: { type: String, enum: ["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"], default: "DRAFT" },
  value: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);
