import { Response } from "express";
import Supplier from "../models/Supplier";
import SupplierTransaction from "../models/SupplierTransaction";
import { Tenant } from "../models/Tenant";
import mongoose from "mongoose";
import { NotificationService } from "../services/notification.service";
import { NotificationType } from "../models/Notification";
import { AuditService, AuditAction } from "../services/audit.service";

export class SupplierController {
  // Liste tous les fournisseurs du tenant
  static getAll = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { search, status, category } = req.query;

      let query: any = { tenantId };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (status) query.status = status;
      if (category) query.category = category;

      const suppliers = await Supplier.find(query).sort({ name: 1 });

      const totalGlobalDebt = suppliers.reduce(
        (acc, s) => acc + (s.totalDebt || 0),
        0,
      );
      const partnersWithDebt = suppliers.filter(
        (s) => (s.totalDebt || 0) > 0,
      ).length;

      res.json({
        success: true,
        data: suppliers,
        summary: {
          totalGlobalDebt,
          partnersWithDebt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Création avec validation des champs pro
  static create = async (req: any, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user;

      // Validate tenantId
      if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid tenant ID" });
      }

      const {
        name,
        phone,
        email,
        address,
        contactPerson,
        category,
        taxId,
        paymentTerms,
        bankDetails,
        creditLimit,
      } = req.body;

      // 1. Quota Check (Mandated by GEMINI.md)
      const tenant = await Tenant.findOne({ _id: tenantId });
      if (!tenant) {
        return res
          .status(400)
          .json({ success: false, message: "Tenant not found" });
      }

      const supplierCount = await Supplier.countDocuments({ tenantId });

      if (supplierCount >= (tenant.maxSuppliers || 10)) {
        return res.status(403).json({
          success: false,
          message: `Quota de fournisseurs atteint (${tenant.maxSuppliers}). Veuillez passer au forfait supérieur.`,
        });
      }

      const newSupplier = new Supplier({
        name,
        phone,
        email,
        address,
        contactPerson,
        category,
        taxId,
        paymentTerms,
        bankDetails,
        creditLimit: Number(creditLimit) || 100000,
        tenantId,
        totalDebt: 0,
        status: "ACTIVE",
      });

      await newSupplier.save();

      // 2. Forensic Audit Traceability
      await AuditService.log(
        tenantId,
        userId,
        AuditAction.ASSET_CREATED,
        `Fournisseur créé: ${name}`,
        { supplierId: newSupplier._id },
      );

      res.status(201).json({ success: true, data: newSupplier });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getById = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const supplier = await Supplier.findOne({ _id: req.params.id, tenantId });
      if (!supplier)
        return res
          .status(404)
          .json({ success: false, message: "Fournisseur introuvable" });
      res.json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static update = async (req: any, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user;
      const updated = await Supplier.findOneAndUpdate(
        { _id: req.params.id, tenantId },
        req.body,
        { new: true },
      );

      if (updated) {
        await AuditService.log(
          tenantId,
          userId,
          AuditAction.ASSET_UPDATED,
          `Modification du fournisseur: ${updated.name}`,
          { supplierId: updated._id },
        );
      } else {
        return res
          .status(404)
          .json({
            success: false,
            message: "Fournisseur introuvable ou accès refusé",
          });
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static delete = async (req: any, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user;
      // Sécurité : On ne peut pas supprimer un fournisseur s'il a une dette active
      const supplier = await Supplier.findOne({ _id: req.params.id, tenantId });
      if (!supplier) {
        return res
          .status(404)
          .json({ success: false, message: "Fournisseur introuvable" });
      }

      if (supplier.totalDebt !== 0) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Impossible de supprimer un fournisseur avec un solde non nul.",
          });
      }

      const name = supplier.name;
      await Supplier.findByIdAndDelete(req.params.id);

      await AuditService.log(
        tenantId,
        userId,
        AuditAction.ASSET_DELETED,
        `Suppression du fournisseur: ${name}`,
        { supplierId: req.params.id },
      );

      res.json({ success: true, message: "Fournisseur retiré avec succès" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // --- MOTEUR DE TRANSACTIONS (VRAIE COMPTABILITÉ) ---

  static addTransaction = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const {
        type,
        amount,
        reference,
        description,
        date,
        dueDate,
        documentUrl,
        paymentStatus,
        paymentMethod,
        chequeDetails,
      } = req.body;
      const { tenantId, id: userId } = req.user;

      const supplier = await Supplier.findOne({ _id: id, tenantId });
      if (!supplier)
        return res
          .status(404)
          .json({ success: false, message: "Fournisseur introuvable" });

      const transactionAmount = Number(amount);

      // --- ORACLE CREDIT ENGINE ---
      if (type === "INVOICE" || type === "DEBIT_NOTE") {
        const potentialDebt = (supplier.totalDebt || 0) + transactionAmount;
        if (potentialDebt > supplier.creditLimit) {
          await NotificationService.notifyAdmins(
            tenantId,
            "Alerte Limite Crédit",
            `Le fournisseur ${supplier.name} a dépassé sa limite de crédit (${supplier.creditLimit} MAD).`,
            NotificationType.WARNING,
          );
          // Note: We still allow it but we notify. In a stricter environment we could block it.
        }
      }

      const transaction = new SupplierTransaction({
        supplierId: id,
        tenantId,
        type,
        amount: transactionAmount,
        reference,
        description,
        date: date || new Date(),
        dueDate,
        documentUrl,
        paymentStatus: type === "INVOICE" ? paymentStatus || "UNPAID" : "PAID",
        paymentMethod,
        chequeDetails,
        approvalStatus: "APPROVED",
      });

      await transaction.save();

      // RECALCUL TOTAL (Méthode de sécurité Oracle)
      const allTransactions = await SupplierTransaction.find({
        supplierId: id,
        tenantId,
      });
      const newTotalDebt = allTransactions.reduce((acc, t) => {
        if (t.type === "INVOICE" || t.type === "DEBIT_NOTE")
          return acc + (t.amount || 0);
        if (t.type === "PAYMENT" || t.type === "CREDIT_NOTE")
          return acc - (t.amount || 0);
        return acc;
      }, 0);

      await Supplier.findOneAndUpdate(
        { _id: id, tenantId },
        { totalDebt: newTotalDebt },
      );

      // Forensic Audit Traceability
      await AuditService.log(
        tenantId,
        userId,
        AuditAction.TRX_COMMITTED,
        `Transaction ${type} ajoutée pour ${supplier.name}: ${transactionAmount} MAD`,
        { supplierId: id, transactionId: transaction._id },
      );

      res
        .status(201)
        .json({
          success: true,
          data: transaction,
          currentBalance: newTotalDebt,
        });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static deleteTransaction = async (req: any, res: Response) => {
    try {
      const { transId, suppId } = req.params;
      const { tenantId, id: userId } = req.user;

      const transaction = await SupplierTransaction.findOne({
        _id: transId,
        tenantId,
      });
      if (transaction) {
        await SupplierTransaction.findByIdAndDelete(transId);

        // Recalcul après suppression
        const allTransactions = await SupplierTransaction.find({
          supplierId: suppId,
          tenantId,
        });
        const newTotalDebt = allTransactions.reduce((acc, t) => {
          if (t.type === "INVOICE" || t.type === "DEBIT_NOTE")
            return acc + (t.amount || 0);
          if (t.type === "PAYMENT" || t.type === "CREDIT_NOTE")
            return acc - (t.amount || 0);
          return acc;
        }, 0);

        await Supplier.findOneAndUpdate(
          { _id: suppId, tenantId },
          { totalDebt: newTotalDebt },
        );

        // Forensic Audit Traceability
        await AuditService.log(
          tenantId,
          userId,
          AuditAction.TRX_CANCELED,
          `Transaction ${transaction.type} annulée`,
          { supplierId: suppId, transactionId: transId },
        );

        res.json({ success: true, message: "Transaction annulée" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Transaction introuvable" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getTransactions = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const transactions = await SupplierTransaction.find({
        supplierId: req.params.id,
        tenantId,
      }).sort({ date: -1 });
      res.json({ success: true, data: transactions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static getStats = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const stats = await SupplierTransaction.aggregate([
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(id),
            tenantId,
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$date" },
              year: { $year: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      res.json({ success: true, data: stats || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static exportTransactions = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const transactions = await SupplierTransaction.find({ tenantId })
        .populate("supplierId", "name")
        .sort({ date: -1 });

      // Simple JSON export for frontend to convert to CSV/Excel
      res.json({ success: true, data: transactions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static checkOverdueInvoices = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const today = new Date();

      const overdueInvoices = await SupplierTransaction.find({
        tenantId,
        type: "INVOICE",
        paymentStatus: { $ne: "PAID" },
        dueDate: { $lt: today },
      }).populate("supplierId", "name");

      for (const inv of overdueInvoices) {
        await NotificationService.notifyAdmins(
          tenantId,
          "Échéance Dépassée",
          `La facture #${inv.reference} de ${(inv.supplierId as any).name} est en retard (${inv.amount} MAD).`,
          NotificationType.WARNING,
        );
      }

      res.json({ success: true, count: overdueInvoices.length });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static verify = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user;
      const supplier = await Supplier.findOneAndUpdate(
        { _id: id, tenantId },
        {
          "audit.isVerified": true,
          "audit.lastAuditDate": new Date(),
          "audit.complianceScore": 100,
        },
        { new: true },
      );
      res.json({ success: true, data: supplier });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  static bulkAction = async (req: any, res: Response) => {
    try {
      const { tenantId } = req.user;
      const { action, ids } = req.body;
      if (action === "DELETE") {
        await Supplier.deleteMany({
          _id: { $in: ids },
          tenantId,
          totalDebt: 0,
        });
      } else if (action === "VERIFY") {
        await Supplier.updateMany(
          { _id: { $in: ids }, tenantId },
          { "audit.isVerified": true, "audit.lastAuditDate": new Date() },
        );
      }
      res.json({ success: true, message: "Bulk operation completed" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
