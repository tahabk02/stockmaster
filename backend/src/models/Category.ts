import mongoose, { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    tenantId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const Category = mongoose.models.Category || model<ICategory>("Category", CategorySchema);
