import { Request, Response } from "express";
import Stripe from "stripe";
import { Tenant } from "../models/Tenant";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover" as any,
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`✅ Checkout Session Completed: ${session.id}`);

      // Extract metadata
      const tenantId = session.metadata?.tenantId;
      const planName = session.metadata?.planName as "PRO" | "ENTERPRISE";
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!tenantId || !planName || !customerId || !subscriptionId) {
        console.error("Missing metadata in checkout.session.completed event.");
        return res.status(400).send("Missing metadata");
      }

      // Update tenant in your database
      await Tenant.findOneAndUpdate(
        { slug: tenantId },
        {
          plan: planName,
          subscriptionStatus: "ACTIVE",
          customerId: customerId,
          subscriptionId: subscriptionId,
          expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Example: set to 1 year from now
        },
        { new: true }
      );
      console.log(`Tenant ${tenantId} updated to plan ${planName}`);
      break;

    case "invoice.payment_succeeded":
      // Handle successful subscription payments
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`💰 Invoice Payment Succeeded: ${invoice.id}`);
      // You might want to update the tenant's subscription status or renewal date here
      break;

    case "customer.subscription.updated":
      const subscription = event.data.object as any;
      console.log(`🔄 Subscription Updated: ${subscription.id}`);
      // Update subscription status, plan, or expiry based on 'subscription.status'
      // You can find the associated tenant using subscription.customer (customerId)
      const tenant = await Tenant.findOne({ customerId: subscription.customer });
      if (tenant) {
        tenant.subscriptionStatus = subscription.status.toUpperCase() as any; // active, canceled, past_due, etc.
        tenant.expiresAt = new Date(subscription.current_period_end * 1000); // Unix timestamp to Date
        await tenant.save();
        console.log(`Tenant ${tenant.slug} subscription status updated to ${subscription.status}`);
      }
      break;

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription;
      console.log(`🗑️ Subscription Deleted: ${deletedSubscription.id}`);
      const tenantDel = await Tenant.findOne({ customerId: deletedSubscription.customer });
      if (tenantDel) {
        tenantDel.plan = "FREE";
        tenantDel.subscriptionStatus = "CANCELED";
        tenantDel.subscriptionId = undefined;
        tenantDel.expiresAt = undefined;
        await tenantDel.save();
        console.log(`Tenant ${tenantDel.slug} subscription canceled and reverted to FREE plan`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send();
};
