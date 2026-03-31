import mongoose, { Schema, Document } from "mongoose";

export interface IFormula extends Document {
  tenantId: string;
  finishedProductId: mongoose.Types.ObjectId;
  components: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  laborCost: number;
  isActive: boolean;
  createdAt: Date;
}

const FormulaSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  finishedProductId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  components: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true }
  }],
  laborCost: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Formula || mongoose.model<IFormula>("Formula", FormulaSchema);
