import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "https://backend-stock-master-pro.vercel.app/api",
  timeout: 60000, 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// إضافة التوكين أوتوماتيكياً
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. إذا لم يستجب السيرفر أصلاً (Network Error)
    if (!error.response) {
      console.error("CRITICAL: Network Error. Server at", error.config?.baseURL, "is unreachable.");
      toast.error("Le serveur est injoignable. Vérifiez votre connexion.");
      return Promise.reject({ message: "Serveur hors ligne" });
    }

    console.error(`API Error [${error.response.status}]:`, error.response.data);

    // 2. إذا انتهت الجلسة (401)
    if (error.response.status === 401) {
      console.warn("Session expirée...");
      localStorage.clear(); // مسح كل البيانات لضمان نظافة الجلسة
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // 3. إذا كانت الصلاحية ناقصة (403)
    if (error.response.status === 403) {
      console.error("Accès refusé - Droits insuffisants");
    }

    return Promise.reject(error);
  },
);

export default api;
