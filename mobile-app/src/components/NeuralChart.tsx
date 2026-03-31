import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { useAppTheme } from '../theme';

const { width } = Dimensions.get('window');
const BAR_COUNT = 20;

export const NeuralChart = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <AnimatedBar key={i} index={i} />
      ))}
    </View>
  );
};

const AnimatedBar = ({ index }: { index: number }) => {
  const { colors } = useAppTheme();
  const height = useSharedValue(10);

  useEffect(() => {
    height.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 60 + 20, { duration: 500 + Math.random() * 1000 }),
        withTiming(Math.random() * 40 + 10, { duration: 500 + Math.random() * 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: interpolate(height.value, [10, 80], [0.3, 1]),
  }));

  return (
    <Animated.View 
      style={[
        styles.bar, 
        { backgroundColor: index % 3 === 0 ? colors.primary : colors.accent },
        animatedStyle
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    width: '100%',
    paddingHorizontal: 10,
  },
  bar: {
    width: (width - 100) / BAR_COUNT,
    borderRadius: 4,
    marginHorizontal: 1,
  }
});
