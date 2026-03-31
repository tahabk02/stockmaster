import mongoose, { Schema, Document } from "mongoose";

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING", // Waiting for initial payment
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PAST_DUE = "PAST_DUE", // Payment failed
  TRIAL = "TRIAL",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUALLY = "ANNUALLY",
}

export interface ISubscription extends Document {
  tenantId: string; // Tenant owning this subscription
  clientId?: mongoose.Types.ObjectId; // Client (customer) associated with the subscription (if applicable)
  userId: mongoose.Types.ObjectId; // User who initiated/manages the subscription
  planId: mongoose.Types.ObjectId; // Reference to a Subscription Plan
  planName: string; // Denormalized plan name
  price: number;
  currency: string;
  
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_WALLET';
  paymentGatewaySubscriptionId?: string; // e.g., Stripe Subscription ID, CMI Mandate ID
  cmiToken?: string; // Token for recurring CMI payments

  status: SubscriptionStatus;
  billingCycle: BillingCycle;

  startDate: Date;
  endDate?: Date; // When subscription actually ends (e.g., if cancelled mid-cycle)
  nextRenewalDate: Date; // Next date payment is due

  trialEndDate?: Date; // If subscription has a trial period
  
  autoRenew: boolean;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "MAD" }, // Moroccan Dirham

    paymentMethod: { 
      type: String, 
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_WALLET'], 
      required: true 
    },
    paymentGatewaySubscriptionId: { type: String },
    cmiToken: { type: String },

    status: { 
      type: String, 
      enum: Object.values(SubscriptionStatus), 
      default: SubscriptionStatus.PENDING 
    },
    billingCycle: { 
      type: String, 
      enum: Object.values(BillingCycle), 
      required: true 
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextRenewalDate: { type: Date, required: true },

    trialEndDate: { type: Date },

    autoRenew: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ tenantId: 1, userId: 1, status: 1 });
SubscriptionSchema.index({ nextRenewalDate: 1, status: 1 });

export default mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
