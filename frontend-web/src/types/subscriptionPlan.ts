import { PlanStatus, BillingCycle } from "./subscription.constants";

// استخدام type بدل interface يحل مشكل الـ Export في Vite
export type SubscriptionPlan = {
  _id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  status: PlanStatus;
  isTrialAvailable: boolean;
  trialDays: number;
  maxProducts: number;
  maxUsers: number;
  maxStorageGB: number;
  stripeProductId?: string;
  cmiPlanId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
