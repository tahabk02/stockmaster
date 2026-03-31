export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PAST_DUE = "PAST_DUE",
  TRIAL = "TRIAL",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUALLY = "ANNUALLY",
}

export interface Subscription {
  _id: string;
  tenantId: string;
  clientId?: string; // Storing as string to match ObjectId from backend
  userId: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_WALLET';
  paymentGatewaySubscriptionId?: string;
  cmiToken?: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string; // ISO date string
  endDate?: string;
  nextRenewalDate: string;
  trialEndDate?: string;
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
