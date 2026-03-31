import mongoose, { Schema, Document } from "mongoose";

export interface IWarehouseCell {
  id: string;
  row: number;
  col: number;
  type: "EMPTY" | "RACK" | "PALLET" | "DOOR" | "DESK" | "ROBOT";
  label?: string;
  occupancy?: number;
  productId?: mongoose.Types.ObjectId; // Lien vers le produit stocké ici
}

export interface IWarehouseLayout extends Document {
  tenantId: string;
  name: string;
  grid: IWarehouseCell[];
  dimensions: {
    rows: number;
    cols: number;
  };
}

const WarehouseLayoutSchema = new Schema<IWarehouseLayout>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, default: "Main Floor" },
    grid: [
      {
        id: String,
        row: Number,
        col: Number,
        type: { type: String, default: "EMPTY" },
        label: String,
        occupancy: Number,
        productId: { type: Schema.Types.ObjectId, ref: "Product" }
      }
    ],
    dimensions: {
      rows: { type: Number, default: 12 },
      cols: { type: Number, default: 16 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.WarehouseLayout || 
  mongoose.model<IWarehouseLayout>("WarehouseLayout", WarehouseLayoutSchema);
