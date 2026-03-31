import { Router } from "express";

// استيراد جميع الممرات (Routes)
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import orderRoutes from "./order.routes";
import purchaseRoutes from "./purchase.routes";
import reportRoutes from "./report.routes";
import supplierRoutes from "./supplier.routes";
import jobRoutes from "./job.routes";
import settingsRoutes from "./settings.routes";
// 🆕 إضافة ممر الـ Audit
import auditRoutes from "./audit.routes";
import userRoutes from "./user.routes";
import notificationRoutes from "./notification.routes";
import communityRoutes from "./community.routes";
import chatRoutes from "./chat.routes";
import stockRoutes from "./stock.routes";
import aiRoutes from "./ai.routes";
import saasRoutes from "./saas.routes";
import adminRoutes from "./admin.routes";
import systemRoutes from "./system.routes";

import clientRoutes from "./client.routes";
import subscriptionRoutes from "./subscription.routes";
import logisticsRoutes from "./logistics.routes";
import financialRoutes from "./financial.routes";
import integrationRoutes from "./integration.routes";
import marketingRoutes from "./marketing.routes";
import returnRoutes from "./return.routes";
import expenseRoutes from "./expense.routes";
import taskRoutes from "./task.routes";
import documentRoutes from "./document.routes";
import productionRoutes from "./production.routes";
import hrRoutes from "./hr.routes";
import contractRoutes from "./contract.routes";
import qualityRoutes from "./quality.routes";
import legalRoutes from "./legal.routes";
import mongoose from "mongoose";

const router = Router();

router.get("/diag", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
    models: mongoose.modelNames(),
    uptime: process.uptime()
  });
});

/**
 * البوابة المركزية لـ API التطبيق (/api/...)
 */

// 1️⃣ نظام الحماية (Login/Register)
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);

// 2️⃣ إدارة المنتجات والمخزون
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/stock", stockRoutes);

// 3️⃣ نظام المبيعات والطلبيات
router.use("/orders", orderRoutes);

// 4️⃣ نظام المشتريات والتموين
router.use("/purchases", purchaseRoutes);
router.use("/clients", clientRoutes); // 🆕 إدارة العملاء
router.use("/subscriptions", subscriptionRoutes); // 🆕 إدارة الاشتراكات

// 5️⃣ موديول التقارير والإحصائيات الحية
router.use("/reports", reportRoutes);

// 6️⃣ إدارة الموردين
router.use("/suppliers", supplierRoutes);

// 7️⃣ التحكم في المهام الخلفية (الـ Jobs)
router.use("/jobs", jobRoutes);

// 8️⃣ إعدادات المتجر والـ Tenant
router.use("/settings", settingsRoutes);

// 9️⃣ سجل المراجعة (Audit Logs) 👈 هذا السطر سيحل مشكلة الـ 404
router.use("/audit", auditRoutes);

// 🔟 إدارة المستخدمين (Team)
router.use("/users", userRoutes);

// 1️⃣1️⃣ نظام الإشعارات
router.use("/notifications", notificationRoutes);

// 1️⃣2️⃣ المجتمع (Community)
router.use("/community", communityRoutes);

// 1️⃣3️⃣ نظام المحادثة (Chat)
router.use("/chat", chatRoutes);

// 1️⃣4️⃣ الذكاء الاصطناعي (AI)
router.use("/ai", aiRoutes);

// 1️⃣5️⃣ SaaS & Administration (Super Admin)
router.use("/saas", saasRoutes);
router.use("/admin", adminRoutes);
router.use("/system", systemRoutes);
router.use("/logistics", logisticsRoutes);
router.use("/financial", financialRoutes);
router.use("/integrations", integrationRoutes);
router.use("/marketing", marketingRoutes);
router.use("/returns", returnRoutes);
router.use("/expenses", expenseRoutes);
router.use("/tasks", taskRoutes);
router.use("/documents", documentRoutes);
router.use("/production", productionRoutes);
router.use("/hr", hrRoutes);
router.use("/contracts", contractRoutes);
router.use("/quality", qualityRoutes);
router.use("/legal", legalRoutes);

export default router;
