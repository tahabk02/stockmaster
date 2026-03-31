import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { useAppTheme } from "../theme";
import { BlurView } from "expo-blur";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "light" | "dark" | "transparent" | "primary" | "accent";
  intensity?: number;
}

export const GlassCard = ({ children, style, variant, intensity = 20 }: GlassCardProps) => {
  const { colors, isDarkMode } = useAppTheme();

  let backgroundColor = colors.glass;
  let borderColor = colors.glassBorder;
  let blurTint: "light" | "dark" | "default" = isDarkMode ? "dark" : "light";

  if (variant === "dark") {
    backgroundColor = "rgba(2, 6, 23, 0.7)";
    borderColor = "rgba(255, 255, 255, 0.1)";
    blurTint = "dark";
  } else if (variant === "light") {
    backgroundColor = "rgba(255, 255, 255, 0.7)";
    borderColor = "rgba(15, 23, 42, 0.1)";
    blurTint = "light";
  } else if (variant === "transparent") {
    backgroundColor = "rgba(255, 255, 255, 0.03)";
    borderColor = "rgba(255, 255, 255, 0.08)";
    blurTint = isDarkMode ? "dark" : "light";
  } else if (variant === "primary") {
    backgroundColor = colors.primary + "15";
    borderColor = colors.primary + "30";
  } else if (variant === "accent") {
    backgroundColor = colors.accent + "15";
    borderColor = colors.accent + "30";
  }

  const content = (
    <View style={[styles.inner, { borderColor }, style]}>
      {children}
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webCard, { backgroundColor, borderColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView 
        intensity={intensity} 
        tint={blurTint} 
        style={styles.blur}
      >
        <View style={[styles.overlay, { backgroundColor }]} />
        {content}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  blur: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  inner: {
    padding: 20,
    borderRadius: 24,
  },
  webCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
  },
});
