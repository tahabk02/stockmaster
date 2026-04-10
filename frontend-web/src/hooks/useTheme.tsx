import React, { useEffect } from "react";
import { useThemeStore } from "../store/theme.slice";
import { useAuth } from "../store/auth.slice";
import api from "../api/client";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const { user } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.remove("light");

    // Smooth transition logic handled by CSS transition-colors
  }, [theme]);

  // Sync with backend if user changes theme, or use localStorage for guests
  useEffect(() => {
    const isDark = theme === "dark";
    if (user) {
      api.patch("/users/preferences", { darkMode: isDark }).catch(() => {});
    } else {
      localStorage.setItem("guest-theme", theme);
    }
  }, [theme, user]);

  return <>{children}</>;
};

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  return { theme, toggleTheme, setTheme, isDarkMode: theme === "dark" };
};
