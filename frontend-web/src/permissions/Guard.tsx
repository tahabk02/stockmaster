import React from "react";
import { can } from "./can";

interface GuardProps {
  permission: string;
  children: React.ReactNode;
  showError?: boolean; // Optionnel : pour afficher un message au lieu de "rien"
}

export const Guard = ({
  permission,
  children,
  showError = false,
}: GuardProps) => {
  const token = localStorage.getItem("token");

  const getUserRoleFromToken = () => {
    if (!token) return null;
    try {
      // split(".")[1] récupère le payload du JWT
      const payload = JSON.parse(window.atob(token.split(".")[1]));
      return payload.role || null;
    } catch (e) {
      return null;
    }
  };

  const userRole = getUserRoleFromToken();

  // ✅ 1. Logique d'accès
  const isGlobalAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
  const isVendor = userRole === "VENDOR";
  
  // Vendors cannot access ADMIN_ACCESS routes (like global admin dashboard)
  let hasAccess = false;
  if (isGlobalAdmin) hasAccess = true;
  else if (isVendor && permission === "ADMIN_ACCESS") hasAccess = false;
  else hasAccess = userRole ? can(userRole, permission) : false;

  // ✅ 2. Gestion du refus d'accès
  if (!hasAccess) {
    if (showError) {
      return (
        <div className="flex flex-col items-center justify-center p-10 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[2rem] text-rose-600">
          <p className="font-black uppercase tracking-tighter italic">
            Accès restreint
          </p>
          <p className="text-xs font-bold opacity-70">
            Vous n'avez pas la permission [{permission}]
          </p>
        </div>
      );
    }
    return null; // Retourne rien pour les éléments d'interface (boutons, liens)
  }

  return <>{children}</>;
};
