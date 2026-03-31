import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import Supplier from "../models/Supplier";
import Client from "../models/Client";
import { OrderStatus } from "../enums/OrderStatus";
import { StockMovement } from "../models/StockMovement";
import { StockType } from "../enums/StockType";
import mongoose from "mongoose";
import { NotificationService } from "../services/notification.service";
import { NotificationType } from "../models/Notification";
import { addMailJob } from "../jobs/sendMail.job";
import { emailTemplates } from "../services/mail.service";
import { catchAsync } from "../utils/catchAsync";
import { UserRole } from "../enums/UserRole";
import { AppError } from "../utils/AppError";

import { PDFGenerator } from "../utils/pdfGen";
import { Tenant } from "../models/Tenant";
import { AuditService, AuditAction } from "../services/audit.service";

export class OrderController {
  // ... existing methods

  static downloadInvoice = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId } = req.user;

    const order = await Order.findOne({ _id: id, tenantId })
      .populate("items.productId")
      .populate("clientId");

    if (!order) throw new AppError("Order not found", 404);

    const tenant = await Tenant.findOne({ slug: tenantId });
    if (!tenant) throw new AppError("Tenant node compromised", 404);

    const pdfBuffer = await PDFGenerator.generateOrderInvoice(order, tenant);

    // Forensic Signal
    await AuditService.log(
      tenantId,
      req.user._id,
      AuditAction.MANIFEST_ACCESSED,
      `Fiscal manifest accessed: ${order.receiptNumber}`,
      { orderId: order._id, ref: order.receiptNumber }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.receiptNumber}.pdf`);
    res.send(pdfBuffer);
  });

  // 1. Création d'une commande (Version Simple sans Transaction pour Localhost)
  static create = catchAsync(async (req: any, res: Response) => {
    const {
      items,
      paymentMethod,
      amountReceived,
      change,
      transactionId,
      discount = 0,
      clientId,
      type = "SALE"
    } = req.body;

    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new AppError("Tenant ID manquant dans le token.", 403);
    }

    let subTotal = 0;
    const processedItems = [];
    const newOrderId = new mongoose.Types.ObjectId();
    const receiptNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Parcourir les articles pour valider le stock et calculer les prix
    for (const item of items) {
      // HNA: On cherche le produit par ID uniquement (pour permettre le stock partagé)
      const product = await Product.findById(item.productId);

      if (!product) {
        throw new AppError(`Produit non trouvé.`, 404);
      }

      if (product.quantity < item.quantity) {
        throw new AppError(`Stock insuffisant pour ${product.name} (Disponible: ${product.quantity})`, 400);
      }

      subTotal += product.price * item.quantity;
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      // Mise à jour du stock atomique sans session
      product.quantity -= item.quantity;
      await product.save();

      // Historique du mouvement de stock
      await StockMovement.create({
        tenantId,
        productId: item.productId,
        type: StockType.OUT,
        quantity: item.quantity,
        reason: `Vente POS - Commande ${receiptNumber}`,
        referenceType: 'Order',
        referenceId: newOrderId.toString()
      });

      // 🆕 ALERT: Low Stock Notification
      if (product.quantity <= (product.minStockThreshold || 5)) {
        await NotificationService.notifyAdmins(
          tenantId, 
          "Stock Bas détecté", 
          `Le produit ${product.name} est bientôt en rupture (${product.quantity} restants).`, 
          NotificationType.STOCK_ALERT
        );

        // Optionnel: Email Alert
        const admins = await User.find({ tenantId, role: UserRole.ADMIN });
        for (const admin of admins) {
          const template = emailTemplates.lowStockAlert(product.name, product.quantity);
          await addMailJob(admin.email, template.subject, template.html);
        }
      }
    }

    const taxAmount = (subTotal - discount) * 0.02; // Taxe 2%
    const totalPrice = subTotal - discount + taxAmount;
    
    const isNonCash = ["CARD", "CHEQUE", "TRANSFER", "PROMISSORY_NOTE"].includes(paymentMethod);
    const actualAmountReceived = isNonCash ? totalPrice : amountReceived || 0;
    const debt = Math.max(0, totalPrice - actualAmountReceived);

    // Update Client Debt if applicable
    if (clientId) {
      const client = await Client.findOne({ _id: clientId, tenantId });
      if (client) {
          // Check credit limit
          if (client.creditLimit > 0 && (client.totalDebt + debt) > client.creditLimit) {
               throw new AppError(`Crédit insuffisant. Limite: ${client.creditLimit}, Dette actuelle: ${client.totalDebt}, Nouvelle dette: ${debt}`, 400);
          }
          client.totalDebt += debt;
          await client.save();
      }
    }

    const newOrder = new Order({
      _id: newOrderId,
      receiptNumber,
      items: processedItems,
      subTotal,
      taxAmount,
      totalPrice,
      paymentMethod,
      transactionId: isNonCash ? transactionId || `REF-${Date.now()}` : null,
      amountReceived: actualAmountReceived,
      change: isNonCash ? 0 : change || 0,
      tenantId,
      userId: req.user._id,
      clientId,
      type,
      status: OrderStatus.CONFIRMED,
    });

    await newOrder.save();

    // Forensic Signal
    await AuditService.log(
      tenantId,
      req.user._id,
      AuditAction.TRX_COMMITTED,
      `Transaction committed: ${receiptNumber} (Total: ${totalPrice} MAD)`,
      { orderId: newOrderId, total: totalPrice }
    );

    // 🆕 NOTIFY: Order Confirmation
    const isMarketplace = req.body.metadata?.source === "MARKETPLACE";
    await NotificationService.notifyAdmins(
      tenantId,
      isMarketplace ? "🛒 Nouvelle Commande Marketplace" : "Nouvelle Vente",
      isMarketplace 
        ? `Une commande de ${totalPrice.toLocaleString()} MAD a été passée par ${req.body.metadata.customerName}.` 
        : `Une nouvelle vente de ${totalPrice.toLocaleString()} MAD vient d'être validée.`,
      isMarketplace ? NotificationType.ORDER_PENDING : NotificationType.ORDER_CONFIRMED
    );

    res.status(201).json({ success: true, data: newOrder });
  });

  // 2. Récupérer TOUTES les commandes
  static getAll = catchAsync(async (req: any, res: Response) => {
    const { tenantId, role } = req.user;
    console.log(`[Order BI] Fetching orders for Role: ${role}, Tenant: ${tenantId}`);
    
    const query =
      role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN ? {} : { tenantId };

    const orders = await Order.find(query)
      .populate("items.productId")
      .populate("clientId")
      .sort({ createdAt: -1 });

    console.log(`[Order BI] Found ${orders.length} orders.`);

    res.json({ success: true, data: orders });
  });

  // 2.5 Récupérer UNE commande par ID
  static getById = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { tenantId, role } = req.user;

    const query: any = { _id: id };
    if (role !== UserRole.SUPER_ADMIN && role !== UserRole.ADMIN) {
      query.tenantId = tenantId;
    }

    const order = await Order.findOne(query)
      .populate("items.productId")
      .populate("clientId");

    if (!order) throw new AppError("Order not found", 404);

    res.json({ success: true, data: order });
  });

  // 3. Stats pour le Dashboard
  static getStats = catchAsync(async (req: any, res: Response) => {
    const { tenantId } = req.user;
    const matchFilter = mongoose.Types.ObjectId.isValid(tenantId)
      ? { tenantId: new mongoose.Types.ObjectId(tenantId) }
      : { tenantId: tenantId };

    const stats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || { totalRevenue: 0, orderCount: 0 },
    });
  });

  // 4. Commandes mobiles en attente
  static getMobilePending = catchAsync(async (req: any, res: Response) => {
    const tenantId = req.user?.tenantId;
    const orders = await Order.find({
      tenantId,
      status: OrderStatus.PENDING,
    })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  });

  // 5. Synchroniser une commande depuis le mobile
  static syncMobileOrder = catchAsync(async (req: any, res: Response) => {
    const { items, totalPrice, paymentMethod } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) throw new AppError("Tenant ID missing", 400);

    const mobileOrder = new Order({
      receiptNumber: `MOB-${Date.now()}`,
      items,
      totalPrice,
      paymentMethod,
      tenantId,
      status: OrderStatus.PENDING,
      userId: req.user._id,
    });

    await mobileOrder.save();
    res.status(201).json({ success: true, data: mobileOrder });
  });
}
