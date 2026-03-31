import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: string;
  tenantId: string;
  action: string;
  details: string;
  method: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  userId: { type: String, required: true },
  tenantId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  details: { type: String },
  method: { type: String, uppercase: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
