import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ ضروري بزاف باش يقرا الملف .env
dotenv.config();

export async function connectDatabase() {
  // كيقرا الرابط من .env، وإلا مالقاهش كيدير الافتراضي
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/stockmaster-pro";

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // كيقفل السيرفر إلا مكنش اتصال بقاعدة البيانات
  }
}
