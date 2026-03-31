import React, { useState, useEffect } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolate,
} from 'react-native-reanimated';
import { useAppTheme } from '../theme';
import { Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export const ForensicButton = ({ onPress }: { onPress: () => void }) => {
  const theme = useAppTheme();
  const { colors } = theme;
  const [status, setStatus] = useState('GENERATE_STRATEGIC_DOSSIER');
  const [loading, setLoading] = useState(false);
  
  const scanPos = useSharedValue(-100);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);
  }, []);

  const startSequence = async () => {
    if (loading) return;
    setLoading(true);
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Scan animation trigger
    scanPos.value = withTiming(300, { duration: 1500 }, () => {
      scanPos.value = -100;
    });

    setStatus('AUTHENTICATING_NEURAL_LINK...');
    setTimeout(() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setStatus('ANALYZING_REGISTRY_PATTERNS...');
    }, 1000);

    setTimeout(() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setStatus('COMPILING_FORENSIC_DOSSIER...');
    }, 2000);

    setTimeout(() => {
      setLoading(false);
      setStatus('GENERATE_STRATEGIC_DOSSIER');
      onPress();
    }, 3500);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowOpacity: interpolate(pulse.value, [1, 1.05], [0.3, 0.6]),
  }));

  const scanStyle = useAnimatedStyle(() => ({
    left: scanPos.value,
  }));

  return (
    <Animated.View style={[styles.container, { shadowColor: colors.primary }, containerStyle]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={startSequence} 
        style={[styles.button, { backgroundColor: colors.secondary, borderColor: colors.border }, loading && { borderColor: colors.primary, backgroundColor: '#000' }]}
      >
        {/* Scanning Light Effect */}
        <Animated.View style={[styles.scanBar, { backgroundColor: colors.primary + '40' }, scanStyle]} />
        
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Zap size={18} color="#fff" fill="white" />
          )}
          <Text style={styles.text}>{status}</Text>
        </View>

        {/* Tactical Corner Brackets */}
        <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 15,
  },
  button: {
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  scanBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    transform: [{ skewX: '-20deg' }],
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 10,
    height: 10,
  },
  tl: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
});
