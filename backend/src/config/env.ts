import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
import Logger from "../utils/logger";

dotenv.config(); // Look in CWD
dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // Look in backend root relative to src or dist

const envSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  MONGODB_URI: z.string().url().default("mongodb://localhost:27017/stockmaster-pro"),
  JWT_SECRET: z.string().min(10).default("super_secret_key_123"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  
  // SMTP Config
  MAIL_HOST: z.string().default("smtp.mailtrap.io"),
  MAIL_PORT: z.string().default("2525").transform(Number),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Gemini API
  GEMINI_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

// Fallback to empty object if validation failed on Vercel to prevent crash on module load, 
// though downstream usage might still fail if critical vars are missing.
export const ENV = parsedEnv.success ? parsedEnv.data : (envSchema.parse({}) as any); 
