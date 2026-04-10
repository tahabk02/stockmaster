import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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
    console.error("--- API RESPONSE ERROR ---");
    
    // 1. Network Error (No response)
    if (!error.response) {
      console.error("TYPE: Network_Error / unreachable");
      console.error("BASE_URL:", error.config?.baseURL);
      console.error("MESSAGE:", error.message);
      toast.error("Le serveur est injoignable. Vérifiez votre connexion.");
      return Promise.reject({ message: "Serveur hors ligne" });
    }

    const { status, data } = error.response;
    console.error(`STATUS: ${status}`);
    console.error("DATA:", data);

    // 2. Specific Logic based on status
    if (status === 401) {
      console.warn("ACTION: Session expired, clearing local storage");
      localStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.error("ACTION: Forbidden access - missing permissions");
    } else if (status === 500) {
      console.error("ACTION: Internal Server Error - check backend logs");
    }

    console.error("--- END API ERROR ---");
    return Promise.reject(error);
  },
);

export default api;
