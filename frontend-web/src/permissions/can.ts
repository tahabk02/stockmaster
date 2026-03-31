import { UserRole } from "../types/UserRole";

export const PERMISSIONS = {
  // Produits
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",

  // Ventes (Sales)
  SALES_VIEW: "sales:view", // Permission pour voir la page/catalogue
  SALES_CREATE: "sales:create", // Permission pour Encaisser (Valider la vente)

  // Achats et Rapports
  PURCHASES_VIEW: "purchases:view",
  REPORTS_VIEW: "reports:view",
  INVOICES_VIEW: "invoices:view",
  SETTINGS_VIEW: "settings:view",

  // Équipe
  TEAM_VIEW: "team:view",
  TEAM_MANAGE: "team:manage",

  // Administration Global (SaaS)
  ADMIN_ACCESS: "admin:access",
};

const permissionsMap: Record<string, string[]> = {
  // SUPER_ADMIN : Accès absolu à tout
  [UserRole.SUPER_ADMIN]: [...Object.values(PERMISSIONS)],

  // ADMIN : Accès complet aux opérations
  [UserRole.ADMIN]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.ADMIN_ACCESS,
  ],

  // MANAGER : Gestion opérationnelle et stocks
  [UserRole.MANAGER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.INVOICES_VIEW,
  ],

  // STAFF : Uniquement la caisse et voir les produits
  [UserRole.STAFF]: [
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.PRODUCTS_VIEW,
  ],

  // VENDOR : Peut vendre ses produits et voir le stock
  [UserRole.VENDOR]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_MANAGE,
  ],

  // USER (Taha) : Accès complet à l'interface de vente et encaissement
  [UserRole.USER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE, // ✅ DAROURI : Bach t-ban l-button "Encaisser"
  ],
};

/**
 * Vérifie si un rôle possède une permission spécifique
 */
export const can = (role: string | null, permission: string): boolean => {
  if (!role) return false;

  // On s'assure que le rôle est en MAJUSCULES pour matcher les clés du UserRole
  const userRole = role.toUpperCase();

  // On récupère la liste des permissions pour ce rôle
  const userPermissions = permissionsMap[userRole] || [];

  // Vérification
  return userPermissions.includes(permission);
};
