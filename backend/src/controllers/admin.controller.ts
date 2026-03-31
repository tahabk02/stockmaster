import { Request, Response } from "express";
import { Tenant } from "../models/Tenant";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export class AdminController {
  static getStats = catchAsync(async (req: Request, res: Response) => {
    // 1. Core KPIs
    const totalTenants = await Tenant.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // 2. Financial & Subscription Metrics
    const activeSubscriptions = await Tenant.countDocuments({ subscriptionStatus: "ACTIVE" });
    const proTenants = await Tenant.countDocuments({ plan: "PRO" });
    const enterpriseTenants = await Tenant.countDocuments({ plan: "ENTERPRISE" });
    
    // Mock MRR Calculation (based on plans)
    const estimatedMRR = (proTenants * 49) + (enterpriseTenants * 199);

    // 3. Growth Trends (Last 6 Months Mock)
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const growthData = months.map((month, i) => ({
      name: month,
      tenants: Math.floor(totalTenants * (0.6 + (i * 0.08))),
      revenue: Math.floor(estimatedMRR * (0.5 + (i * 0.1)))
    }));

    // 4. Tenant Distribution (by Plan)
    const distribution = [
      { name: 'FREE', value: await Tenant.countDocuments({ plan: "FREE" }) },
      { name: 'PRO', value: proTenants },
      { name: 'ENTERPRISE', value: enterpriseTenants },
    ];

    // 5. System Health (Mocks for dashboard)
    const systemHealth = {
      api: { status: 'optimal', latency: '12ms' },
      db: { status: 'optimal', load: '14%' },
      storage: { status: 'optimal', usage: '28%' }
    };

    res.json({
      success: true,
      data: {
        kpis: {
          totalTenants,
          totalUsers,
          totalProducts,
          totalOrders,
          estimatedMRR,
          activeSubscriptions
        },
        growthData,
        distribution,
        systemHealth
      },
    });
  });

  static getAllTenants = catchAsync(async (req: Request, res: Response) => {
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
    
    // Logic: Calculate resource utilization for every node in the cluster
    const enrichedTenants = await Promise.all(tenants.map(async (t: any) => {
      const productCount = await Product.countDocuments({ tenantId: t.slug });
      const userCount = await User.countDocuments({ tenantId: t.slug });
      
      // Calculate capacity percentages
      const productUsage = Math.min(Math.round((productCount / t.maxProducts) * 100), 100);
      const userUsage = Math.min(Math.round((userCount / t.maxUsers) * 100), 100);
      
      return {
        ...t,
        usage: {
          products: { current: productCount, limit: t.maxProducts, percent: productUsage },
          users: { current: userCount, limit: t.maxUsers, percent: userUsage }
        }
      };
    }));

    res.json({ success: true, data: enrichedTenants });
  });

  static updateTenant = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenant = await Tenant.findByIdAndUpdate(id, req.body, { new: true });
    if (!tenant) throw new AppError("Tenant not found", 404);
    res.json({ success: true, data: tenant });
  });

  static deleteTenant = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenant = await Tenant.findByIdAndDelete(id);
    if (!tenant) throw new AppError("Tenant not found", 404);
    res.json({ success: true, message: "Tenant deleted successfully" });
  });

  static getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  });

  static updateTenantStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Assuming we add 'isActive' to Tenant model if not present, 
    // or just using subscriptionStatus
    const tenant = await Tenant.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!tenant) throw new AppError("Tenant not found", 404);
    
    res.json({ success: true, data: tenant });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, message: "User deleted successfully" });
  });
}
