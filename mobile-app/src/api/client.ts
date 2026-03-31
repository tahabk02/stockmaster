import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/auth.store";
import Constants from "expo-constants";
const { Platform } = require("react-native");

// Robust IP discovery using Expo Constants (Works for simulators and real devices)
const getDevHost = () => {
  if (Platform.OS === "web") return window.location.hostname;
  
  // Try manifest2 (Newer Expo versions)
  const manifest2 = Constants.expoConfig || (Constants as any).manifest2;
  const debuggerHost = manifest2?.hostUri || (Constants as any).manifest?.hostUri;
  
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    console.log(`[API] Discovery: hostUri found -> ${host}`);
    return host;
  }
  
  // Fallbacks
  if (Platform.OS === "android") {
    console.log("[API] Discovery: Falling back to Android emulator host (10.0.2.2)");
    return "10.0.2.2";
  }
  
  console.log("[API] Discovery: Falling back to localhost (iOS Sim/Web)");
  return "localhost";
};

const DEV_IP = getDevHost();
const BASE_URL = `http://${DEV_IP}:3000/api/`;
console.log(`[API] Static Base URL: ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Auth Token and Platform Info
api.interceptors.request.use(
  async (config) => {
    config.headers["X-Platform"] = Platform.OS;
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Global unauthorized handling
      await useAuthStore.getState().logout();
      console.log("[Auth] Unauthorized - Session Cleared");
    }
    return Promise.reject(error);
  },
);

export default api;
