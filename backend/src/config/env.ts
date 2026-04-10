import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
import Logger from "../utils/logger";

dotenv.config(); // Look in CWD
dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // Look in backend root relative to src or dist

const envSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  MONGODB_URI: z.string().optional(),
  MONGO_URI: z.string().optional(),
  JWT_SECRET: z.string().min(10).default("super_secret_key_123"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  
  // SMTP Config
  MAIL_HOST: z.string().default("smtp.mailtrap.io"),
  MAIL_PORT: z.string().default("2525").transform(Number),
  MAIL_USER: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),
  MAIL_PASS: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),
  CLOUDINARY_API_KEY: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),
  CLOUDINARY_API_SECRET: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),
  STRIPE_WEBHOOK_SECRET: z.string().optional().transform(v => v === 'PLACEHOLDER' ? undefined : v),

  // Gemini API
  GEMINI_API_KEY: z.string().optional().transform(v => (v === 'PLACEHOLDER' || v?.startsWith('YOUR_')) ? undefined : v),
}).transform((data) => {
  const rawUri = data.MONGODB_URI || data.MONGO_URI || "mongodb://localhost:27017/stockmaster";
  
  // Robust URI processing
  let processedUri = rawUri;
  try {
    const schemeMatch = rawUri.match(/^([^:]+):\/\//);
    if (schemeMatch) {
      const scheme = schemeMatch[1];
      let rest = rawUri.substring(scheme.length + 3);

      let credentials = "";
      let hostAndPath = rest;
      if (rest.includes("@")) {
        const lastAtIndex = rest.lastIndexOf("@");
        credentials = rest.substring(0, lastAtIndex);
        hostAndPath = rest.substring(lastAtIndex + 1);
      }

      if (credentials && credentials.includes(":")) {
        const colonIndex = credentials.indexOf(":");
        const username = credentials.substring(0, colonIndex);
        const password = credentials.substring(colonIndex + 1);
        credentials = `${username}:${encodeURIComponent(password)}`;
      }

      let host = hostAndPath;
      let options = "";
      if (hostAndPath.includes("/")) {
        const firstSlashIndex = hostAndPath.indexOf("/");
        host = hostAndPath.substring(0, firstSlashIndex);
        const pathAndOptions = hostAndPath.substring(firstSlashIndex);
        const questionMarkIndex = pathAndOptions.indexOf("?");
        if (questionMarkIndex !== -1) {
          options = pathAndOptions.substring(questionMarkIndex);
        }
      } else if (hostAndPath.includes("?")) {
        const questionMarkIndex = hostAndPath.indexOf("?");
        host = hostAndPath.substring(0, questionMarkIndex);
        options = hostAndPath.substring(questionMarkIndex);
      }

      const credsPart = credentials ? `${credentials}@` : "";
      processedUri = `${scheme}://${credsPart}${host}/stockmaster${options}`;
    }
  } catch (error) {
    console.error("Error processing MongoDB URI:", error);
  }

  return {
    ...data,
    DATABASE_URL: processedUri,
  };
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
  const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
  if (!IS_VERCEL) {
    process.exit(1);
  }
}

// Fallback to empty object if validation failed on Vercel to prevent crash on module load, 
// though downstream usage might still fail if critical vars are missing.
export const ENV = parsedEnv.success ? parsedEnv.data : (envSchema.parse({}) as any); 
