import { Request, Response } from "express";
import Subscription, { ISubscription, SubscriptionStatus, BillingCycle } from "../models/Subscription";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/SubscriptionPlan";
import { AuthRequest } from "../middlewares/auth.middleware";
import Client from "../models/Client"; // Assuming Client model exists
import { UserRole } from "../enums/UserRole";
import { catchAsync } from "../utils/catchAsync";

export class SubscriptionController {
  /**
   * Get all subscriptions for a tenant
   */
  static getAllSubscriptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { tenantId, role } = req.user!;
    const { status, clientId, userId, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (role === UserRole.SUPER_ADMIN) {
      // Super admin can see all subscriptions, optionally filter by tenantId
      if (tenantId) query.tenantId = tenantId;
    } else {
      query.tenantId = tenantId;
    }

    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (userId) query.userId = userId;

    const subscriptions = await Subscription.find(query)
      .populate("planId")
      .populate("clientId")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      data: subscriptions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  });

  /**
   * Get a single subscription by ID
   */
  static getSubscriptionById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { tenantId, role } = req.user!;

    const query: any = { _id: id };
    if (role !== UserRole.SUPER_ADMIN) {
      query.tenantId = tenantId;
    }

    const subscription = await Subscription.findOne(query)
      .populate("planId")
      .populate("clientId");

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    res.json({ success: true, data: subscription });
  });

  /**
   * Create a new subscription
   */
  static createSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
    const { tenantId, _id: userId } = req.user!;
    const {
      planId,
      paymentMethod,
      billingCycle,
      clientId,
      autoRenew = true,
    } = req.body;

    // 1. Fetch Subscription Plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    // 2. Calculate Start, End, and Renewal Dates
    const startDate = new Date();
    let nextRenewalDate = new Date(startDate);

    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 3);
        break;
      case BillingCycle.ANNUALLY:
        nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid billing cycle" });
    }

    // Handle Trial Period
    let status = SubscriptionStatus.PENDING; // Assuming payment will be processed next
    let trialEndDate: Date | undefined;
    if (plan.isTrialAvailable && plan.trialDays > 0) {
      trialEndDate = new Date(startDate);
      trialEndDate.setDate(trialEndDate.getDate() + plan.trialDays);
      status = SubscriptionStatus.TRIAL;
    }

    // 3. Create Subscription in DB
    const newSubscription: ISubscription = new Subscription({
      tenantId,
      userId,
      clientId,
      planId: plan._id,
      planName: plan.name,
      price: plan.price,
      currency: plan.currency,
      paymentMethod,
      billingCycle,
      status,
      startDate,
      nextRenewalDate,
      trialEndDate,
      autoRenew,
    });

    await newSubscription.save();
    res.status(201).json({ success: true, data: newSubscription });
  });

  /**
   * Update an existing subscription
   */
  static updateSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { tenantId, role } = req.user!;
    const updates = req.body;

    const query: any = { _id: id };
    if (role !== UserRole.SUPER_ADMIN) {
      query.tenantId = tenantId;
    }

    // Prevent direct modification of certain fields via this endpoint
    delete updates.tenantId;
    delete updates.userId;
    delete updates.planId;
    delete updates.planName;
    delete updates.price;
    delete updates.currency;
    delete updates.startDate;
    delete updates.paymentGatewaySubscriptionId;
    delete updates.cmiToken;

    const updatedSubscription = await Subscription.findOneAndUpdate(
      query,
      updates,
      { new: true }
    ).populate("planId");

    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    res.json({ success: true, data: updatedSubscription });
  });

  /**
   * Cancel a subscription
   */
  static cancelSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { tenantId, role } = req.user!;

    const query: any = { _id: id };
    if (role !== UserRole.SUPER_ADMIN) {
      query.tenantId = tenantId;
    }

    const cancelledSubscription = await Subscription.findOneAndUpdate(
      query,
      { status: SubscriptionStatus.CANCELLED, endDate: new Date() },
      { new: true }
    ).populate("planId");

    if (!cancelledSubscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    res.json({ success: true, data: cancelledSubscription });
  });

    /**
   * Get all subscription plans
   */
  static getAllSubscriptionPlans = catchAsync(async (req: AuthRequest, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const plans = await SubscriptionPlan.find(query)
      .sort({ order: 1, price: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await SubscriptionPlan.countDocuments(query);

    res.json({
      success: true,
      data: plans,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  });

  /**
   * Get a single subscription plan by ID
   */
  static getSubscriptionPlanById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    res.json({ success: true, data: plan });
  });

  /**
   * Create a new subscription plan (Admin/Super Admin only)
   */
  static createSubscriptionPlan = catchAsync(async (req: AuthRequest, res: Response) => {
    const { role } = req.user!;
    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: "Unauthorized to create subscription plans" });
    }

    const {
      name,
      description,
      features,
      price,
      currency,
      billingCycle,
      status,
      isTrialAvailable,
      trialDays,
      stripeProductId,
      cmiPlanId,
      order,
    } = req.body;

    const newPlan: ISubscriptionPlan = new SubscriptionPlan({
      name,
      description,
      features,
      price,
      currency,
      billingCycle,
      status,
      isTrialAvailable,
      trialDays,
      stripeProductId,
      cmiPlanId,
      order,
    });

    await newPlan.save();
    res.status(201).json({ success: true, data: newPlan });
  });

  /**
   * Update an existing subscription plan (Admin/Super Admin only)
   */
  static updateSubscriptionPlan = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.user!;
    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: "Unauthorized to update subscription plans" });
    }

    const updates = req.body;
    delete updates._id; // Prevent _id from being updated

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    res.json({ success: true, data: updatedPlan });
  });

  /**
   * Delete a subscription plan (Admin/Super Admin only)
   */
  static deleteSubscriptionPlan = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.user!;
    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete subscription plans" });
    }

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    res.json({ success: true, message: "Subscription plan deleted successfully" });
  });
}
