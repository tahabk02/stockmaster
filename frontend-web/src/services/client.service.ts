import api from "../api/client";
import type { Client } from "../types/client";

export const getClients = async (page = 1, search = "") => {
  const res = await api.get(`/clients?page=${page}&search=${search}`);
  return res.data;
};

export const getClientById = async (id: string) => {
  const res = await api.get(`/clients/${id}`);
  return res.data;
};

export const createClient = async (data: Partial<Client>) => {
  const res = await api.post(`/clients`, data);
  return res.data;
};

export const updateClient = async (id: string, data: Partial<Client>) => {
  const res = await api.put(`/clients/${id}`, data);
  return res.data;
};

export const deleteClient = async (id: string) => {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
};
