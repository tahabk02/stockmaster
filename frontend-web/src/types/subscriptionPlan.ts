export enum PlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEPRECATED = "DEPRECATED",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUALLY = "ANNUALLY",
}

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
  stripeProductId?: string;
  cmiPlanId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
