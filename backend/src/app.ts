import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import apiRoutes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { handleStripeWebhook } from "./controllers/stripe.webhook.controller"; 

console.log('--- 🛡️ Neural Core Initialization ---');
console.log('Checking Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'LOADED' : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'LOADED' : 'MISSING');
console.log('-------------------------------------');

const app: Application = express();

// --- 1. NUCLEAR CORS & PREFLIGHT (MANUAL) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://stockmaster-6kas.vercel.app'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for non-browser or non-whitelisted requests
    res.setHeader('Access-Control-Allow-Origin', 'https://stockmaster-6kas.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// --- 2. STRIPE WEBHOOK (Needs raw body) ---
app.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// --- 2. SECURITY & LOGGING ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(morgan("combined"));

// --- 4. BODY PARSING ---
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- 5. FORENSIC AUDIT ---
import { forensicAuditMiddleware } from "./middlewares/audit.middleware";
app.use("/api", forensicAuditMiddleware);

// --- 6. DOCUMENTATION ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 7. ROUTES ---
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'StockMaster Pro API is Live', version: '1.0.0' });
});
app.use("/api", apiRoutes);
app.use("/", apiRoutes); 

// --- 8. ERROR HANDLING ---
app.use(errorMiddleware);

export default app;
