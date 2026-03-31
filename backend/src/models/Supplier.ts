import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  category?: string;
  // --- Oracle Level Fields ---
  taxId?: string; // ICE ou IF
  paymentTerms: 'IMMEDIATE' | 'NET30' | 'NET60' | 'COD'; 
  bankDetails?: {
    bankName?: string;
    rib?: string;
  };
  rating: number; // 1-5 étoiles
  status: 'ACTIVE' | 'ON_HOLD' | 'BLACKLISTED';
  totalDebt: number;
  creditLimit: number; 
  // --- Institutional Vectors ---
  performance: {
    reliability: number; // 0-100%
    priceIndex: number; // 0-100%
    leadTimeAvg: number; // Days
  };
  audit: {
    isVerified: boolean;
    lastAuditDate?: Date;
    complianceScore: number;
  };
  tenantId: string;
  documents?: {
    name: string;
    url: string;
    type: string;
    date: Date;
  }[];
  createdAt: Date;
}

const SupplierSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    contactPerson: { type: String },
    category: { type: String, default: "Général" },
    taxId: { type: String },
    paymentTerms: { 
      type: String, 
      enum: ['IMMEDIATE', 'NET30', 'NET60', 'COD'], 
      default: 'NET30' 
    },
    bankDetails: {
      bankName: String,
      rib: String,
    },
    rating: { type: Number, default: 5 },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'ON_HOLD', 'BLACKLISTED'], 
      default: 'ACTIVE' 
    },
    totalDebt: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 100000 },
    performance: {
      reliability: { type: Number, default: 100 },
      priceIndex: { type: Number, default: 100 },
      leadTimeAvg: { type: Number, default: 0 },
    },
    audit: {
      isVerified: { type: Boolean, default: false },
      lastAuditDate: { type: Date },
      complianceScore: { type: Number, default: 100 },
    },
    tenantId: { type: String, required: true, index: true },
    documents: [
      {
        name: String,
        url: String,
        type: { type: String },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true },
);

export default mongoose.models.Supplier ||
  mongoose.model<ISupplier>("Supplier", SupplierSchema);
