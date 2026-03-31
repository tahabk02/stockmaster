import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Category } from "./src/models/Category";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stockmaster";

async function seedCategories() {
  try {
    console.log("🌱 Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Connected to MongoDB...");

    const tenantId = "MAIN-PLATFORM";
    
    // Clear existing categories for this tenant to start fresh for 40
    await Category.deleteMany({ tenantId });
    console.log("🗑️ Cleared existing categories for MAIN-PLATFORM");

    const categoryNames = [
      "Moteur", "Freinage", "Pneumatique", "Éclairage", "Carrosserie", 
      "Transmission", "Suspension", "Échappement", "Refroidissement", "Électrique",
      "Intérieur", "Accessoires", "Lubrifiants", "Filtration", "Climatisation",
      "Outillage", "Batteries", "Embrayage", "Direction", "Sécurité",
      "Électronique", "Audio", "Navigation", "Entretien", "Peinture",
      "Nettoyage", "Protection", "Rangement", "Confort", "Performance",
      "Off-road", "Racing", "Vintage", "Hybride", "Électrique-EV",
      "Remorquage", "Hiver", "Été", "Toutes-Saisons", "Premium"
    ];

    const categories = categoryNames.map(name => ({
      name,
      slug: name.toLowerCase().replace(/ /g, "-"),
      tenantId,
      description: `Description for ${name}`
    }));

    await Category.insertMany(categories);
    console.log(`✅ Successfully seeded ${categories.length} categories.`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedCategories();
