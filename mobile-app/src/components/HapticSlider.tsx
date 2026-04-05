import React, { useState } from "react";
import { View, Text, StyleSheet, PanResponder, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "../theme";
import { Minus, Plus } from "lucide-react-native";

interface HapticSliderProps {
  initialValue: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
}

export const HapticSlider = ({
  initialValue,
  min = 0,
  max = 9999,
  onValueChange,
}: HapticSliderProps) => {
  const { colors, isDarkMode } = useAppTheme();
  const [value, setValue] = useState(initialValue);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const progress = useSharedValue((initialValue - min) / (max - min));

  const triggerHaptic = async (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(style);
    }
  };

  const updateValue = (delta: number) => {
    const newValue = Math.min(Math.max(value + delta, min), max);
    if (newValue !== value) {
      setValue(newValue);
      progress.value = withSpring((newValue - min) / (max - min), {
        damping: 18,
        stiffness: 120,
      });
      onValueChange(newValue);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      scale.value = withSpring(0.95);
      if (Platform.OS !== "web") {
        Haptics.selectionAsync();
      }
    },
    onPanResponderMove: (_, gestureState) => {
      translateX.value = gestureState.dx;

      // Threshold for triggering change
      if (gestureState.dx > 50) {
        runOnJS(updateValue)(1);
        translateX.value = 0; // Reset for continuous slide
      } else if (gestureState.dx < -50) {
        runOnJS(updateValue)(-1);
        translateX.value = 0;
      }
    },
    onPanResponderRelease: () => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
    },
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progress.value * 100))}%`,
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
            borderColor: colors.border,
          },
        ]}
      >
        <Animated.View style={[styles.progress, progressStyle]}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={[0, 0.5]}
            end={[1, 0.5]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Minus size={16} color={colors.textLight} />
        <View style={styles.spacer} />
        <Plus size={16} color={colors.textLight} />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.knob,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            borderColor: "rgba(255,255,255,0.25)",
          },
          knobStyle,
        ]}
      >
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.label}>UNITS</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    justifyContent: "center",
    marginVertical: 10,
  },
  track: {
    position: "absolute",
    width: "100%",
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  spacer: {
    flex: 1,
  },
  progress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 25,
  },
  knob: {
    width: 120,
    height: 60,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  valueText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  label: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
