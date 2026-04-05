import { Dimensions, Platform, PixelRatio } from "react-native";
import { useThemeStore } from "../store/theme.store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive Scaling Engine
// Advanced Scaling Engine for High-Bandwidth Displays
const scale = (SCREEN_WIDTH / 375) * 1.1;
export const normalize = (size: number) => {
  const newSize = size * scale;
  const rounded = Math.round(PixelRatio.roundToNearestPixel(newSize));
  return Platform.OS === "ios" ? rounded : rounded - 1;
};

export const wp = (percentage: number) =>
  Math.round((SCREEN_WIDTH * percentage) / 100);
export const hp = (percentage: number) =>
  Math.round((SCREEN_HEIGHT * percentage) / 100);

const lightColors = {
  primary: "#6366f1",
  secondary: "#0f172a",
  accent: "#10b981",
  danger: "#f43f5e",
  warning: "#f59e0b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  textLight: "#64748b",
  white: "#ffffff",
  border: "rgba(15, 23, 42, 0.08)",
  glass: "rgba(255, 255, 255, 0.7)",
  glassBorder: "rgba(255, 255, 255, 0.2)",
  cardBg: "#ffffff",
  pulse: "#10b981",
};

const darkColors = {
  primary: "#818cf8",
  secondary: "#1e293b",
  accent: "#34d399",
  danger: "#fb7185",
  warning: "#fbbf24",
  background: "#020617",
  surface: "#0f172a",
  text: "#f8fafc",
  textLight: "#94a3b8",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.08)",
  glass: "rgba(15, 23, 42, 0.7)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  cardBg: "#0f172a",
  pulse: "#34d399",
};

export const theme = {
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmall: SCREEN_WIDTH < 380,
  },
  spacing: {
    xs: normalize(4),
    sm: normalize(8),
    md: normalize(12),
    lg: normalize(20),
    xl: normalize(28),
    xxl: normalize(40),
  },
  roundness: {
    xs: normalize(8),
    sm: normalize(12),
    md: normalize(16),
    lg: normalize(24),
    xl: normalize(32),
    full: 9999,
  },
  typography: {
    h1: { fontSize: normalize(28), fontWeight: "900", letterSpacing: -1 },
    h2: { fontSize: normalize(22), fontWeight: "800", letterSpacing: -0.5 },
    h3: { fontSize: normalize(18), fontWeight: "700" },
    body: { fontSize: normalize(14), fontWeight: "400" },
    caption: {
      fontSize: normalize(10),
      fontWeight: "600",
      textTransform: "uppercase",
    },
    pro: {
      fontWeight: "900",
      textTransform: "uppercase",
      fontStyle: "italic",
      letterSpacing: 1,
    },
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    lg: {
      shadowColor: "#6366f1",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 10,
    },
  },
};

export const useAppTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  return {
    ...theme,
    colors: isDarkMode ? darkColors : lightColors,
    isDarkMode,
  };
};
