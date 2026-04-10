import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { ENV } from "../config/env";
import Product from "../models/Product";
import { Category } from "../models/Category";

const MONGO_URI = ENV.MONGODB_URI;

async function fixCategories() {
  try {
    console.log("🌱 Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Connected to MongoDB...");

    if (!mongoose.connection.db) {
      throw new Error("Database connection not established.");
    }
    const collection = mongoose.connection.db.collection("products");
    const allRawProducts = await collection.find({}).toArray();
    console.log(`📊 Total raw products: ${allRawProducts.length}`);
    
    for (const p of allRawProducts) {
      const cat = p.category;
      const type = typeof cat;
      const isObjectId = cat instanceof mongoose.Types.ObjectId || (cat && mongoose.Types.ObjectId.isValid(cat) && type === "string" && /^[0-9a-fA-F]{24}$/.test(cat));
      
      console.log(`- Raw Product: ${p.name}, Category: ${JSON.stringify(cat)} (Type: ${type})`);
      
      const shouldFix = cat !== null && cat !== undefined && !isObjectId;

      if (shouldFix) {
        console.log(`🎯 Found invalid category: ${JSON.stringify(cat)} (Type: ${type}) in product "${p.name}"`);
        
        let lookupName = "";
        if (type === "string") lookupName = cat;
        else if (type === "object" && cat.name) lookupName = cat.name;

        if (lookupName) {
          // Try to find the category by name
          let category = await Category.findOne({ 
            name: new RegExp(`^${lookupName}$`, "i"),
            tenantId: p.tenantId 
          });

          if (!category) {
            category = await Category.findOne({ 
              name: new RegExp(`^${lookupName}$`, "i")
            });
          }

          if (category) {
            await collection.updateOne({ _id: p._id }, { $set: { category: category._id } });
            console.log(`✅ Fixed product "${p.name}" with category ID ${category._id}`);
          } else {
            await collection.updateOne({ _id: p._id }, { $set: { category: null } });
            console.log(`⚠️ Could not find category "${lookupName}". Set to null.`);
          }
        } else {
          await collection.updateOne({ _id: p._id }, { $set: { category: null } });
          console.log(`⚠️ Invalid category type and no name found. Set to null.`);
        }
      }
    }

    console.log("✨ Data fix completed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fix Error:", error);
    process.exit(1);
  }
}

fixCategories();
