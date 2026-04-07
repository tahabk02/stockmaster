// src/types/subscription.constants.ts

/**
 * حالة خطة الأسعار نفسها (الموجودة في لوحة التحكم)
 */
export enum PlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  DEPRECATED = "DEPRECATED",
}

/**
 * حالة اشتراك المستخدم في خطة معينة
 */
export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  TRIAL = "TRIAL",
  PENDING = "PENDING",
  PAST_DUE = "PAST_DUE",
}

/**
 * دورات الفوترة المدعومة
 */
export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  ANNUALLY = "YEARLY", // ALIAS for compatibility
  QUARTERLY = "QUARTERLY",
  WEEKLY = "WEEKLY",
}
