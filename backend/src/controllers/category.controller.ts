import { Request, Response } from "express";
import { Category } from "../models/Category";
import { AuditService, AuditAction } from "../services/audit.service";

export class CategoryController {
  static async getAll(req: any, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const categories = await Category.find({ tenantId });
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const { tenantId, id: userId } = req.user as any;
      const { name, description, icon } = req.body;
      
      const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      
      const category = await Category.create({
        name,
        slug,
        description,
        icon,
        tenantId,
      });

      await AuditService.log(
        tenantId,
        userId,
        AuditAction.ASSET_CREATED,
        `Catégorie créée: ${name}`,
        { entityId: (category._id as any).toString() }
      );

      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const { tenantId, id: userId } = req.user as any;
      const { id } = req.params;
      const { name, description, icon } = req.body;

      const slug = name ? name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") : undefined;

      const category = await Category.findOneAndUpdate(
        { _id: id, tenantId },
        { name, slug, description, icon },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await AuditService.log(
        tenantId,
        userId,
        AuditAction.ASSET_UPDATED,
        `Catégorie modifiée: ${category.name}`,
        { entityId: id }
      );

      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const { tenantId, id: userId } = req.user as any;
      const { id } = req.params;

      const category = await Category.findOneAndDelete({ _id: id, tenantId });

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await AuditService.log(
        tenantId,
        userId,
        AuditAction.ASSET_DELETED,
        `Catégorie supprimée: ${category.name}`,
        { entityId: id }
      );

      res.json({ message: "Category deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
