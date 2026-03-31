import mongoose, { Schema, Document } from "mongoose";
import { BillingCycle } from "./Subscription"; // Assuming BillingCycle enum is in Subscription.ts

export enum PlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEPRECATED = "DEPRECATED",
}

export interface ISubscriptionPlan extends Document {
  name: string;
  description: string;
  features: string[]; // e.g., ["Unlimited Products", "Advanced Reports"]
  price: number; // Price per billing cycle
  currency: string;
  billingCycle: BillingCycle;
  status: PlanStatus;
  isTrialAvailable: boolean;
  trialDays: number;
  maxProducts: number;
  maxUsers: number;
  maxStorageGB: number;
  stripeProductId?: string; 
  stripePriceId?: string;
  order: number; 
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    features: [{ type: String }],
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "MAD" },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PlanStatus),
      default: PlanStatus.ACTIVE,
    },
    isTrialAvailable: { type: Boolean, default: false },
    trialDays: { type: Number, default: 0 },
    maxProducts: { type: Number, default: 100 },
    maxUsers: { type: Number, default: 5 },
    maxStorageGB: { type: Number, default: 1 },
    stripeProductId: { type: String },
    stripePriceId: { type: String },
    cmiPlanId: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);
