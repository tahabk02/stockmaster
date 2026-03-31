export enum StockType {
  IN = "IN", // Stock received from suppliers or production
  OUT = "OUT", // Stock sold or consumed
  ADJUSTMENT = "ADJUSTMENT", // Manual correction for discrepancies
  TRANSFER = "TRANSFER", // Stock moved between locations
  RETURN = "RETURN", // Customer returns
  DAMAGE = "DAMAGE", // Stock damaged and removed from inventory
  LOSS = "LOSS", // Stock lost or stolen
  PURCHASE_RETURN = "PURCHASE_RETURN", // Returning stock to supplier
}
