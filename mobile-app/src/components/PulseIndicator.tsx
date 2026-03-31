import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolate,
  Extrapolate,
  Easing
} from "react-native-reanimated";
import { useAppTheme } from "../theme";

interface PulseIndicatorProps {
  color?: string;
  size?: number;
}

export const PulseIndicator = ({ 
  color, 
  size = 12 
}: PulseIndicatorProps) => {
  const { colors } = useAppTheme();
  const activeColor = color || colors.accent;
  const pulse = useSharedValue(0);

  useEffect(() => {
    // Faster, sharper pulse for 'technical' feel
    pulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pulse.value,
      [0, 0.5, 1],
      [0.8, 0.1, 0], // Starts stronger, fades faster
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      pulse.value,
      [0, 1],
      [1, 2.5], // Slightly tighter scale
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View 
        style={[
          styles.pulse, 
          { backgroundColor: activeColor, width: size, height: size, borderRadius: size / 2 },
          animatedStyle
        ]} 
      />
      <View 
        style={[
          styles.dot, 
          { backgroundColor: activeColor, width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  pulse: {
    position: "absolute",
  },
  dot: {
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
});
