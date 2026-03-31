import { Request, Response, NextFunction } from "express";
import { Tenant } from "../models/Tenant";
import Product from "../models/Product";
import User from "../models/User";

export const subscriptionGuard = async (req: any, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Accès refusé: Aucun Tenant ID." });

    const tenant = await Tenant.findOne({ slug: tenantId });
    if (!tenant) return res.status(404).json({ message: "Magasin introuvable." });

    // Autoriser uniquement les abonnements ACTIVE ou TRIAL (nouveaux comptes)
    const allowedStatuses = ["ACTIVE", "TRIAL"];
    if (!allowedStatuses.includes(tenant.subscriptionStatus)) {
      console.warn(`[Subscription Guard] Access Denied for Tenant ${tenantId}. Status: ${tenant.subscriptionStatus}`);
      return res.status(403).json({ 
        success: false,
        message: `Accès refusé: Votre abonnement est ${tenant.subscriptionStatus}. Veuillez régulariser votre situation pour continuer.`,
        subscriptionStatus: tenant.subscriptionStatus
      });
    }

    // Attacher le tenant à la requête pour usage ultérieur
    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkProductLimit = async (req: any, res: Response, next: NextFunction) => {
  const tenant = req.tenant;
  const productCount = await Product.countDocuments({ tenantId: tenant.slug });

  if (productCount >= tenant.maxProducts) {
    return res.status(403).json({
      success: false,
      message: `Limite de produits atteinte (${tenant.maxProducts}). Veuillez passer au plan supérieur.`,
      limit: tenant.maxProducts,
      current: productCount
    });
  }
  next();
};

export const checkUserLimit = async (req: any, res: Response, next: NextFunction) => {
  const tenant = req.tenant;
  const userCount = await User.countDocuments({ tenantId: tenant.slug });

  if (userCount >= tenant.maxUsers) {
    return res.status(403).json({
      success: false,
      message: `Limite d'utilisateurs atteinte (${tenant.maxUsers}). Veuillez passer au plan supérieur.`,
      limit: tenant.maxUsers,
      current: userCount
    });
  }
  next();
};
