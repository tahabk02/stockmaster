import { create } from "zustand";
import api from "../api/client";

interface Tenant {
  _id: string;
  name: string;
  legalName?: string;
  slug: string;
  logo?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  vatNumber?: string;
  blackFriday?: {
    active: boolean;
    discountPercentage: number;
    bannerMessage: string;
  };
  plan: string;
  subscriptionStatus?: string;
  currency?: string;
  settings?: {
    themeColor?: string;
    currency?: string;
  };
}

interface TenantState {
  tenant: Tenant | null;
  loading: boolean;
  fetchTenant: () => Promise<void>;
  updateTenant: (data: Partial<Tenant>) => Promise<any>; // Return response data
  clearTenant: () => void;
}

export const useTenant = create<TenantState>((set, get) => ({
  tenant: JSON.parse(localStorage.getItem("store_info") || "null"),
  loading: false,

  fetchTenant: async () => {
    set({ loading: true });
    try {
      const response = await api.get("/settings");
      if (response.data.success) {
        localStorage.setItem("store_info", JSON.stringify(response.data.data));
        set({ tenant: response.data.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch tenant", error);
      set({ loading: false });
    }
  },

  updateTenant: async (data) => {
    set({ loading: true });
    try {
      const response = await api.put("/settings", data);
      if (response.data.success) {
        // Update local storage and state
        const updatedTenant = response.data.data;
        localStorage.setItem("store_info", JSON.stringify(updatedTenant));
        set({ tenant: updatedTenant, loading: false });
      } else {
        set({ loading: false });
      }
      return response.data;
    } catch (error) {
      console.error("Failed to update tenant", error);
      set({ loading: false });
      throw error;
    }
  },

  clearTenant: () => {
    localStorage.removeItem("store_info");
    set({ tenant: null });
  },
}));
