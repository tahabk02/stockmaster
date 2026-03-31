import api from "../api/client";
// ✅ التصحيح: استخدام 'import type' ضروري جداً هنا لمنع خطأ SyntaxError في Vite
import type { Subscription } from "../types/subscription";

/**
 * جلب قائمة الاشتراكات مع دعم البحث والصفحات
 */
export const getSubscriptions = async (page = 1, search = "") => {
  const res = await api.get(`/subscriptions?page=${page}&search=${search}`);
  return res.data;
};

/**
 * جلب تفاصيل اشتراك محدد بواسطة المعرف
 */
export const getSubscriptionById = async (id: string) => {
  const res = await api.get(`/subscriptions/${id}`);
  return res.data;
};

/**
 * إنشاء اشتراك جديد
 */
export const createSubscription = async (data: Partial<Subscription>) => {
  const res = await api.post(`/subscriptions`, data);
  return res.data;
};

/**
 * تحديث بيانات اشتراك موجود
 */
export const updateSubscription = async (
  id: string,
  data: Partial<Subscription>,
) => {
  const res = await api.put(`/subscriptions/${id}`, data);
  return res.data;
};

/**
 * إلغاء اشتراك محدد
 */
export const cancelSubscription = async (id: string) => {
  const res = await api.patch(`/subscriptions/${id}/cancel`);
  return res.data;
};
