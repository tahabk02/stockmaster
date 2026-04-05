import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setCorporateStyling: (styling: Partial<Pick<ThemeState, 'primaryColor' | 'accentColor' | 'fontFamily'>>) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      primaryColor: '#4f46e5', // Default Indigo 600
      accentColor: '#10b981',  // Default Emerald 500
      fontFamily: 'Inter, system-ui, sans-serif',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      setCorporateStyling: (styling) => set((state) => ({ ...state, ...styling })),
    }),
    {
      name: 'neural-os-theme',
    }
  )
);
