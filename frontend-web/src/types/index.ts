export interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER";
  tenantId: string;
}

export interface Tenant {
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
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: Category | string;
  price: number;
  quantity: number;
  minStockThreshold: number;
  image?: string;
  brand?: string;
  location?: string;
  description?: string;
}
