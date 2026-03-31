import mongoose, { Schema, Document } from "mongoose";

export interface IQualityCheck extends Document {
  tenantId: string;
  productId: mongoose.Types.ObjectId;
  inspectorId: mongoose.Types.ObjectId;
  batchId?: string;
  score: number; // 0-100
  status: "PASS" | "FAIL" | "WARNING";
  anomalies: string[];
  metrics: {
    weight?: number;
    dimensions?: boolean;
    packaging?: boolean;
    functionality?: boolean;
  };
  notes?: string;
  createdAt: Date;
}

const QualityCheckSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  inspectorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  batchId: { type: String },
  score: { type: Number, required: true },
  status: { type: String, enum: ["PASS", "FAIL", "WARNING"], required: true },
  anomalies: [{ type: String }],
  metrics: {
    weight: { type: Number },
    dimensions: { type: Boolean },
    packaging: { type: Boolean },
    functionality: { type: Boolean }
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.QualityCheck || mongoose.model<IQualityCheck>("QualityCheck", QualityCheckSchema);
