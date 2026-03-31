import api from "../api/client";
import { saveClientToCache, getCachedClients } from "../utils/database";

export interface Client {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type?: 'INDIVIDUAL' | 'COMPANY';
  status?: 'ACTIVE' | 'INACTIVE';
  totalDebt?: number;
  creditLimit?: number;
  loyaltyPoints?: number;
  stats?: {
    totalSpent: number;
    averageOrderValue: number;
    orderCount: number;
    recentOrders: any[];
  };
}

class ClientService {
  async getClients(search?: string, page: number = 1, limit: number = 20) {
    try {
      const { data } = await api.get("clients", {
        params: { search, page, limit },
      });
      
      // Cache the results for offline access
      if (data.clients && !search) {
        data.clients.forEach((c: Client) => saveClientToCache(c._id!, c));
      }
      
      return data;
    } catch (e) {
      console.warn("[ClientService] Network Failure - Engaging Offline Registry Protocols");
      const offlineClients = getCachedClients();
      if (search) {
        const filtered = offlineClients.filter((c: any) => 
          c.name?.toLowerCase().includes(search.toLowerCase()) || 
          c.phone?.toLowerCase().includes(search.toLowerCase())
        );
        return { clients: filtered, total: filtered.length, page: 1, pages: 1 };
      }
      return { clients: offlineClients, total: offlineClients.length, page: 1, pages: 1 };
    }
  }

  async getClientById(id: string) {
    try {
      const { data } = await api.get(`clients/${id}`);
      saveClientToCache(id, data);
      return data;
    } catch (e) {
      console.warn("[ClientService] Single Node Sync Failure - Querying Local Cache");
      const offlineClients = getCachedClients();
      const client = offlineClients.find((c: any) => c._id === id);
      if (client) return client;
      throw e;
    }
  }

  async createClient(client: Partial<Client>) {
    const { data } = await api.post("clients", client);
    saveClientToCache(data._id, data);
    return data;
  }

  async updateClient(id: string, updates: Partial<Client>) {
    const { data } = await api.put(`clients/${id}`, updates);
    saveClientToCache(id, data);
    return data;
  }

  async deleteClient(id: string) {
    const { data } = await api.delete(`clients/${id}`);
    // Ideally should also delete from SQLite, but for now we'll just ignore it or it will be overwritten
    return data;
  }
}

export default new ClientService();
