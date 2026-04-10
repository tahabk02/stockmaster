import { Response } from "express";
import { Tenant } from "../models/Tenant";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import Stripe from "stripe";
import { AuditService, AuditAction } from "../services/audit.service";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2026-01-28.clover" as any,
});

const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

const plansConfig = {
  PRO: {
    priceId: "price_1PMH0bF79U3h6BfN7k0a4jLz", // Replace with your actual Stripe Price ID for PRO
    amount: 19900, // 199.00 USD (in cents)
    currency: "usd",
    interval: "month",
  },
  ENTERPRISE: {
    priceId: "price_1PMH1ZF79U3h6BfNsF9l2qXh", // Replace with your actual Stripe Price ID for ENTERPRISE
    amount: 99900, // 999.00 USD (in cents)
    interval: "month",
    currency: "usd",
  },
};

export class SaaSController {
  // Get all tenants (Super Admin only)
  static getAllTenants = async (req: any, res: Response) => {
    try {
      const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
      
      // Calculate usage for each tenant
      const enrichedTenants = await Promise.all(tenants.map(async (tenant: any) => {
        const [productCount, userCount] = await Promise.all([
          Product.countDocuments({ tenantId: tenant.slug }),
          User.countDocuments({ tenantId: tenant.slug })
        ]);

        return {
          ...tenant,
          usage: {
            products: {
              current: productCount,
              limit: tenant.maxProducts,
              percent: Math.min(100, (productCount / tenant.maxProducts) * 100)
            },
            users: {
              current: userCount,
              limit: tenant.maxUsers,
              percent: Math.min(100, (userCount / tenant.maxUsers) * 100)
            }
          }
        };
      }));

      res.json({ success: true, data: enrichedTenants });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Update tenant plan and limits
  static updateTenantPlan = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { plan, subscriptionStatus, maxProducts, maxUsers, features } = req.body;

      const tenant = await Tenant.findByIdAndUpdate(
        id,
        { plan, subscriptionStatus, maxProducts, maxUsers, features },
        { new: true }
      );

      if (!tenant) return res.status(404).json({ success: false, message: "Tenant non trouvé" });

      // Forensic Signal
      await AuditService.log(
        "GLOBAL-SAAS",
        req.user._id,
        AuditAction.QUOTA_REALLOCATED,
        `Node Overridden: ${tenant.name} (${tenant.slug}) - Plan: ${plan}`,
        { targetTenantId: tenant.slug, newPlan: plan, limits: { maxProducts, maxUsers } }
      );

      res.json({ success: true, data: tenant });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Global SaaS Stats
  static getGlobalStats = async (req: any, res: Response) => {
    try {
      const [tenantsCount, usersCount, productsCount, ordersCount] = await Promise.all([
        Tenant.countDocuments(),
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments()
      ]);

      const revenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]);

      res.json({
        success: true,
        data: {
          tenants: tenantsCount,
          users: usersCount,
          products: productsCount,
          orders: ordersCount,
          totalRevenue: revenue[0]?.total || 0
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Create Stripe Checkout Session
  static createCheckoutSession = async (req: any, res: Response) => {
    if (!isStripeConfigured) {
      return res.status(503).json({ success: false, message: "Le service de paiement n'est pas configuré sur ce déploiement." });
    }
    const { planName } = req.body;
    const tenantId = req.user.tenantId;
    const userEmail = req.user.email;

    const plan = (plansConfig as any)[planName];

    if (!plan) {
      return res.status(400).json({ success: false, message: "Plan invalide." });
    }

    try {
      const tenant = await Tenant.findOne({ slug: tenantId });
      if (!tenant) return res.status(404).json({ success: false, message: "Tenant introuvable." });

      let customerId = tenant.customerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { tenantId: tenantId },
        });
        customerId = customer.id;
        await Tenant.findOneAndUpdate({ slug: tenantId }, { customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: `${planName} Plan`,
              },
              unit_amount: plan.amount,
              recurring: { interval: plan.interval },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/settings?tab=plans&success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/settings?tab=plans&canceled=true`,
        metadata: {
          tenantId: tenantId,
          planName: planName,
        },
      });

      res.json({ success: true, url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Session Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Create Payment Intent for Embedded Payment
  static createPaymentIntent = async (req: any, res: Response) => {
    if (!isStripeConfigured) {
      return res.status(503).json({ success: false, message: "Le service de paiement n'est pas configuré." });
    }
    const { planName } = req.body;
    const plan = (plansConfig as any)[planName];

    if (!plan) return res.status(400).json({ success: false, message: "Plan invalide." });

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.amount,
        currency: plan.currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          tenantId: req.user.tenantId,
          planName: planName,
        },
      });

      res.json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Payment Intent Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
