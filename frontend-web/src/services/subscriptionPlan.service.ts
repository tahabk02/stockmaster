import api from "../api/client";
// لاحظ استخدام 'import type' هنا ضروري جداً
import type { SubscriptionPlan } from "../types/subscriptionPlan";

export const getSubscriptionPlans = async (page = 1, search = "") => {
  const res = await api.get(
    `/subscriptions/plans?page=${page}&search=${search}`,
  );
  return res.data;
};

export const getSubscriptionPlanById = async (id: string) => {
  const res = await api.get(`/subscriptions/plans/${id}`);
  return res.data;
};

export const createSubscriptionPlan = async (
  data: Partial<SubscriptionPlan>,
) => {
  const res = await api.post(`/subscriptions/plans`, data);
  return res.data;
};

export const updateSubscriptionPlan = async (
  id: string,
  data: Partial<SubscriptionPlan>,
) => {
  const res = await api.put(`/subscriptions/plans/${id}`, data);
  return res.data;
};

export const deleteSubscriptionPlan = async (id: string) => {
  const res = await api.delete(`/subscriptions/plans/${id}`);
  return res.data;
};
