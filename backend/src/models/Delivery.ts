import mongoose, { Schema, Document } from "mongoose";

export enum DeliveryStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export interface IDelivery extends Document {
  tenantId: string;
  orderId: mongoose.Types.ObjectId;
  carrierName: string;
  trackingNumber: string;
  status: DeliveryStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimatedArrival: Date;
  actualArrival?: Date;
  destination: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  createdAt: Date;
}

const DeliverySchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  carrierName: { type: String, default: "Neural Fleet" },
  trackingNumber: { type: String, unique: true, required: true },
  status: { type: String, enum: Object.values(DeliveryStatus), default: DeliveryStatus.PENDING },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
  estimatedArrival: { type: Date },
  actualArrival: { type: Date },
  destination: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);
