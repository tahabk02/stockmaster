import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    detailedDescription: { type: String, default: "" }, // New: for rich text
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" }, 
    gallery: { type: [String], default: [] }, // New: multiple images
    category: { type: Schema.Types.Mixed, ref: "Category", required: false },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: false },
    brand: { type: String, default: "" }, // New: for marketplace feel
    location: { type: String, default: "" }, // New: Room/Aisle/Shelf (Salle/Rayon)
    minStockThreshold: { type: Number, default: 10 },
    tenantId: { type: String, required: true },
    reviews: [
      {
        userName: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now }
      }
    ], // New: customer feedback
    internalComments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        userName: String,
        text: String,
        date: { type: Date, default: Date.now }
      }
    ],
    salesCount: { type: Number, default: 0 } // New: internal popularity tracking
  },
  { timestamps: true },
);

// تجنب خطأ إعادة تعريف الموديل
export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
