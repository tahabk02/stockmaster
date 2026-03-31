import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  tenantId: string;
  title: string;
  content: string;
  category: "SOP" | "LEGAL" | "TECHNICAL" | "TRAINING";
  createdBy: mongoose.Types.ObjectId;
  attachments: string[];
  isPublic: boolean; // Accessible to all staff in tenant
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ["SOP", "LEGAL", "TECHNICAL", "TRAINING"], default: "SOP" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  attachments: [String],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
