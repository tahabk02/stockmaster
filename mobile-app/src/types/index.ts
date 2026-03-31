export interface Product {
  _id?: string;
  id?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  image?: string;
  lastSync?: string;
}

export interface Order {
  id: string;
  customer: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  date: string;
  items?: any[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string;
  rating: number;
}
