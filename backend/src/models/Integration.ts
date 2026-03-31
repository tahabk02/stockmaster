import mongoose, { Schema, Document } from "mongoose";

export interface IIntegration extends Document {
  tenantId: string;
  provider: "SHOPIFY" | "WOOCOMMERCE" | "ZAPIER" | "CUSTOM";
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  config: Record<string, any>;
  apiKey: string;
  lastSync?: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    tenantId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    status: { type: String, default: "ACTIVE" },
    config: { type: Schema.Types.Mixed },
    apiKey: { type: String, required: true },
    lastSync: { type: Date }
  },
  { timestamps: true }
);

export const Integration = mongoose.models.Integration || 
  mongoose.model<IIntegration>("Integration", IntegrationSchema);

// --- Webhook Schema ---
export interface IWebhook extends Document {
  tenantId: string;
  event: "STOCK_LOW" | "ORDER_CREATED" | "PAYMENT_RECEIVED";
  targetUrl: string;
  secret: string;
  isActive: boolean;
}

const WebhookSchema = new Schema<IWebhook>(
  {
    tenantId: { type: String, required: true, index: true },
    event: { type: String, required: true },
    targetUrl: { type: String, required: true },
    secret: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Webhook = mongoose.models.Webhook || 
  mongoose.model<IWebhook>("Webhook", WebhookSchema);
