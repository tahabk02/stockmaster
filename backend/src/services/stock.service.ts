import Product from "../models/Product";
import { StockMovement } from "../models/StockMovement";
import AuditLog from "../models/AuditLog";
import { StockType } from "../enums/StockType";

export class StockService {
  static async adjustStock(
    productId: string,
    quantity: number,
    type: StockType,
    userId: string,
    tenantId: string,
    metadata: { reason?: string; referenceType?: string; referenceId?: string } = {}
  ) {
    // 1. البحث عن المنتج وتحديث الكمية (MongoDB Syntax)
    const product = await Product.findOne({
      _id: productId,
      tenantId: tenantId,
    });

    if (!product) {
      throw new Error("Produit non trouvé ou n'appartient pas à ce tenant");
    }

    // حساب الكمية الجديدة
    const newQuantity =
      type === StockType.IN
        ? product.quantity + quantity
        : product.quantity - quantity;

    // التأكد أن المخزون ما غايوليش سالب (اختياري ولكن محترف)
    if (newQuantity < 0) {
      throw new Error("Stock insuffisant pour cette opération");
    }

    // تحديث المنتج في MongoDB
    product.quantity = newQuantity;
    await product.save();

    // 2. تسجيل الحركة في StockMovement
    await StockMovement.create({
      productId: product._id,
      quantity,
      type,
      userId,
      tenantId,
      reason: metadata.reason || `Manual ${type} adjustment`,
      referenceType: metadata.referenceType || 'Adjustment',
      referenceId: metadata.referenceId
    });

    // 3. تسجيل العملية في AuditLog (Mongoose Style)
    await AuditLog.create({
      userId,
      tenantId,
      action: `STOCK_${type}`,
      details: `Produit: ${product.name}, Modif: ${type === StockType.IN ? "+" : "-"}${quantity}, Nouveau Stock: ${newQuantity}`,
    });

    return product;
  }
}
