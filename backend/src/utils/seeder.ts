import mongoose from "mongoose";
import Product from "../models/Product";
import Supplier from "../models/Supplier";
import Purchase from "../models/Purchase";
import User from "../models/User";
import { Tenant } from "../models/Tenant";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stockmaster-pro";

async function seed() {
  try {
    console.log("🌱 Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Connected to MongoDB for seeding...");

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("👤 No users found. Creating master admin...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Master Admin",
        email: "admin@stockmaster.pro",
        password: hashedPassword,
        role: "ADMIN",
        tenantId: "MAIN-PLATFORM",
        isActive: true
      });
      console.log("✅ Master admin created: admin@stockmaster.pro / admin123");
    }

    const testUser = await User.findOne({ email: "oracle@stockmaster.pro" });
    if (!testUser) {
      console.log("👤 Creating Oracle test account...");
      const hashedOracle = await bcrypt.hash("oracle123", 10);
      await User.create({
        name: "Oracle SCM Tester",
        email: "oracle@stockmaster.pro",
        password: hashedOracle,
        role: "ADMIN",
        tenantId: "MAIN-PLATFORM",
        isActive: true
      });
      console.log("✅ Oracle account ready: oracle@stockmaster.pro / oracle123");
    }

    const tenantCount = await Tenant.countDocuments({ slug: "MAIN-PLATFORM" });
    if (tenantCount === 0) {
      console.log("🏢 Creating MAIN-PLATFORM tenant...");
      await Tenant.create({
        name: "StockMaster Pro HQ",
        slug: "MAIN-PLATFORM",
        plan: "ENTERPRISE",
        subscriptionStatus: "ACTIVE"
      });
      console.log("✅ MAIN-PLATFORM tenant created.");
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("📦 No products found. Seeding dummy data...");
      const dummyProducts = [
        { name: "Moteur High-Performance v8", sku: "MOT-V8-001", price: 45000, quantity: 12, category: "Moteur", tenantId: "MAIN-PLATFORM", description: "Moteur de haute précision." },
        { name: "Kit de Freinage Ceramic", sku: "BRK-CER-099", price: 8500, quantity: 25, category: "Freinage", tenantId: "MAIN-PLATFORM", description: "Système de freinage haute température." }
      ];
      await Product.insertMany(dummyProducts);
      console.log("✅ Dummy products inserted.");
    }

    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      console.log("🚚 No suppliers found. Seeding dummy data...");
      const dummySuppliers = [
        { name: "Global Auto Parts Ltd", phone: "+212 5 22 11 22 33", category: "Grossiste", tenantId: "MAIN-PLATFORM", totalDebt: 0 },
        { name: "Moteur Tech SARL", phone: "+212 5 37 44 55 66", category: "Fabricant", tenantId: "MAIN-PLATFORM", totalDebt: 0 }
      ];
      await Supplier.insertMany(dummySuppliers);
      console.log("✅ Dummy suppliers inserted.");
    }

    const purchaseCount = await Purchase.countDocuments();
    if (purchaseCount === 0) {
      console.log("🛒 Seeding dummy purchases...");
      const supplier = await Supplier.findOne({ name: "Global Auto Parts Ltd" });
      const product = await Product.findOne({ sku: "MOT-V8-001" });

      if (supplier && product) {
        await Purchase.create({
          supplierId: supplier._id,
          tenantId: "MAIN-PLATFORM",
          items: [
            { productId: product._id, quantity: 5, purchasePrice: 40000 }
          ],
          totalAmount: 200000,
          status: "RECEIVED"
        });
        console.log("✅ Dummy purchase created.");
      }
    }

    console.log("✨ Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seed();
