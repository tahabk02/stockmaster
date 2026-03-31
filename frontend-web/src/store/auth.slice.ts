import { create } from "zustand";
import { UserRole } from "../types/UserRole";

export interface AuthUser {
  id: string;
  _id?: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  profileImage?: string;
  followers?: string[];
  following?: string[];
  preferences?: {
    language?: string;
    notifications?: boolean;
    darkMode?: boolean;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser | null, token?: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  setUser: (user, token) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (token) {
        localStorage.setItem("token", token);
        set({ user, token });
      } else {
        set({ user });
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
    window.location.href = "/login";
  },
}));
