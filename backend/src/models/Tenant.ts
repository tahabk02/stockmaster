import mongoose, { Schema, model, Document } from 'mongoose';

export interface TenantDocument extends Document {
  name: string;
  legalName?: string;
  slug: string;
  logo?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  vatNumber?: string;
  blackFriday?: {
    active: boolean;
    discountPercentage: number;
    bannerMessage: string;
  };
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL';
  subscriptionDates: {
    startDate: Date;
    nextBillingDate: Date;
    trialEndDate?: Date;
  };
  isActive: boolean;
  maxProducts: number;
  maxUsers: number;
  maxSuppliers: number;
  maxStorageGB: number;
  currency: {
    code: string;
    symbol: string;
    precision: number;
  };
  region: string;
  customerId?: string;
  subscriptionId?: string;
  expiresAt?: Date;
  // --- Infrastructure Settings ---
  settings: {
    themeColor: string;
    secondaryColor?: string;
    customDomain?: string;
    whiteLabel: boolean;
    fontFamily?: string;
  };
  features: string[];
  createdAt: Date;
}

const tenantSchema = new Schema<TenantDocument>({
  name: { type: String, required: true },
  legalName: { type: String },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  taxId: { type: String },
  vatNumber: { type: String },
  blackFriday: {
    active: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    bannerMessage: { type: String, default: "BLACK FRIDAY MEGA SALE - LIMITED TIME ONLY!" }
  },
  plan: { 
    type: String, 
    enum: ['FREE', 'PRO', 'ENTERPRISE'], 
    default: 'FREE' 
  },
  subscriptionStatus: { 
    type: String, 
    enum: ['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL'], 
    default: 'TRIAL' 
  },
  subscriptionDates: {
    startDate: { type: Date, default: Date.now },
    nextBillingDate: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) },
    trialEndDate: { type: Date, default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000) },
  },
  isActive: { type: Boolean, default: true },
  maxProducts: { type: Number, default: 50 },
  maxUsers: { type: Number, default: 2 },
  maxSuppliers: { type: Number, default: 10 },
  maxStorageGB: { type: Number, default: 1 },
  currency: {
    code: { type: String, default: "MAD" },
    symbol: { type: String, default: "DH" },
    precision: { type: Number, default: 2 }
  },
  region: { type: String, default: "EU-WEST-1" },
  customerId: { type: String },
  subscriptionId: { type: String },
  expiresAt: { type: Date },
  settings: {
    themeColor: { type: String, default: "#6366f1" },
    secondaryColor: { type: String, default: "#4f46e5" },
    customDomain: { type: String },
    whiteLabel: { type: Boolean, default: false },
    fontFamily: { type: String, default: "Inter" }
  },
  features: { type: [String], default: ['basic_reports'] }
}, {
  timestamps: true,
});

export const Tenant = mongoose.models.Tenant || model<TenantDocument>('Tenant', tenantSchema);
