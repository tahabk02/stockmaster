import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { 
  Scan, 
  Plus, 
  Search, 
  Box, 
  Zap, 
  X,
  LayoutGrid
} from 'lucide-react-native';
import { useAppTheme } from '../theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export const NeuralDock = () => {
  const { colors, isDarkMode } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const animation = useSharedValue(0);

  const toggleDock = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsOpen(!isOpen);
    animation.value = withSpring(isOpen ? 0 : 1, { damping: 12, stiffness: 90 });
  };

  const handlePress = async (route: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    router.push(route as any);
    toggleDock();
  };

  const getItemStyle = (index: number, total: number) => {
    const angle = (index / (total - 1)) * Math.PI; // Semicircle distribution
    const radius = 100;

    return useAnimatedStyle(() => {
      const translateY = interpolate(animation.value, [0, 1], [0, -Math.sin(angle) * radius]);
      const translateX = interpolate(animation.value, [0, 1], [0, -Math.cos(angle) * radius]);
      const scale = interpolate(animation.value, [0, 1], [0, 1]);
      const opacity = interpolate(animation.value, [0, 0.5, 1], [0, 0, 1]);

      return {
        transform: [{ translateX }, { translateY }, { scale }],
        opacity,
        position: 'absolute',
        zIndex: -1,
      };
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Blur Overlay when active */}
      {isOpen && (
        <Animated.View 
          entering={withTiming(1)} 
          style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)' }]} 
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={toggleDock} />
        </Animated.View>
      )}

      <View style={styles.dockContainer}>
        {/* Orbital Items */}
        <Animated.View style={getItemStyle(0, 5)}>
          <DockItem icon={<Scan color="#fff" size={20} />} label="SCAN" onPress={() => handlePress('/scan')} color={colors.accent} themeColors={colors} />
        </Animated.View>
        <Animated.View style={getItemStyle(1, 5)}>
          <DockItem icon={<Box color="#fff" size={20} />} label="STOCK" onPress={() => handlePress('/inventory')} color={colors.primary} themeColors={colors} />
        </Animated.View>
        <Animated.View style={getItemStyle(2, 5)}>
          <DockItem icon={<Plus color="#fff" size={20} />} label="ADD" onPress={() => handlePress('/scan')} color={colors.warning} themeColors={colors} />
        </Animated.View>
        <Animated.View style={getItemStyle(3, 5)}>
          <DockItem icon={<Search color="#fff" size={20} />} label="FIND" onPress={() => handlePress('/inventory')} color={colors.textLight} themeColors={colors} />
        </Animated.View>
        <Animated.View style={getItemStyle(4, 5)}>
          <DockItem icon={<LayoutGrid color="#fff" size={20} />} label="HOME" onPress={() => handlePress('/')} color={colors.secondary} themeColors={colors} />
        </Animated.View>

        {/* Main Activator Button */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={toggleDock} 
          style={[styles.mainButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        >
          <Animated.View style={useAnimatedStyle(() => ({ 
            transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 45])}deg` }] 
          }))}>
            {isOpen ? <X color="#fff" size={32} /> : <Zap color="#fff" size={32} fill="white" />}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DockItem = ({ icon, label, onPress, color, themeColors }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor: color }]}>
    {icon}
    <View style={[styles.labelBadge, { backgroundColor: themeColors.secondary }]}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  dockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  item: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  labelBadge: {
    position: 'absolute',
    bottom: -20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  }
});
