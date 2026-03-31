export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  products: {
    list: "/products",
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  orders: {
    create: "/orders",
    list: "/orders",
  },
  purchases: {
    create: "/purchases",
    list: "/purchases",
  },
  suppliers: {
    list: "/suppliers",
    create: "/suppliers",
  },
  audit: {
    list: "/audit-logs",
  },
  dashboard: {
    stats: "/dashboard/stats",
  },
} as const;

export type Endpoints = typeof endpoints;
