import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  tenantId: string;
  name: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  email?: string;
  phone: string;
  address?: string;
  // Commercial/Tax Info
  taxId?: string; // ICE/IF for companies
  vatNumber?: string;
  
  // Financial
  totalDebt: number; // Credit client (money they owe us)
  creditLimit: number; // Max allowed debt
  loyaltyPoints: number;

  status: 'ACTIVE' | 'INACTIVE' | 'BAD_DEBT';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['INDIVIDUAL', 'COMPANY'], 
      default: 'INDIVIDUAL' 
    },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    
    taxId: { type: String },
    vatNumber: { type: String },

    totalDebt: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 }, // 0 means no limit or check logic
    loyaltyPoints: { type: Number, default: 0 },

    status: { 
      type: String, 
      enum: ['ACTIVE', 'INACTIVE', 'BAD_DEBT'], 
      default: 'ACTIVE' 
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for search
ClientSchema.index({ tenantId: 1, name: "text", phone: "text" });

export default mongoose.models.Client ||
  mongoose.model<IClient>("Client", ClientSchema);
