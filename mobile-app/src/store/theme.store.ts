import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: true, // Default to dark as per "Ultra Pro" mandate
  toggleTheme: async () => {
    const newMode = !get().isDarkMode;
    await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    set({ isDarkMode: newMode });
  },
  loadTheme: async () => {
    const stored = await AsyncStorage.getItem('themeMode');
    if (stored) {
      set({ isDarkMode: stored === 'dark' });
    }
  },
}));
