import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform, StatusBar } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay, 
  runOnJS,
  FadeIn,
  FadeOut,
  ZoomIn,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, TrendingUp, Zap } from 'lucide-react-native';
import { useAppTheme, normalize } from '../theme';

const { width, height } = Dimensions.get('window');

const FLIPBOOK_IMAGES = [
  "https://images.unsplash.com/photo-1611974714024-4607a0265a96?q=80&w=800", // Trading Candles
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800", // Warehouse
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800", // Gold/Tech
  "https://images.unsplash.com/photo-1551288049-bbda4865cda1?q=80&w=800", // Dashboards
];

export const CinematicSplash = ({ onFinish }: { onFinish: () => void }) => {
  const { colors } = useAppTheme();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. RAPID FLIPBOOK EFFECT (100ms per image)
    let count = 0;
    const interval = setInterval(() => {
      if (count < 12) { // 3 loops of 4 images
        setCurrentImgIndex((prev) => (prev + 1) % FLIPBOOK_IMAGES.length);
        count++;
      } else {
        clearInterval(interval);
        runOnJS(startLogoReveal)();
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const startLogoReveal = () => {
    setShowLogo(true);
    // 2. LOGO REVEAL ANIMATION
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withTiming(1, { 
      duration: 1200, 
      easing: Easing.out(Easing.back(1.5)) 
    });
    
    // 3. CINEMATIC FLASH
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 800 })
    );

    // 4. FINISH SEQUENCE
    setTimeout(() => {
      onFinish();
    }, 3500);
  };

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {!showLogo ? (
        <Animated.View exiting={FadeOut.duration(500)} style={StyleSheet.absoluteFill}>
          <Image 
            source={{ uri: FLIPBOOK_IMAGES[currentImgIndex] }} 
            style={styles.flipImage}
            resizeMode="cover"
          />
          <View style={[styles.scanline, { backgroundColor: colors.primary + '40' }]} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(1000)} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['#06060F', '#0F172A', '#06060F']}
            style={StyleSheet.absoluteFill}
          />
          
          <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
            <View style={styles.logoCircle}>
               <LinearGradient
                 colors={['#D4AF37', '#996515']} // Gold Metallic
                 style={styles.goldGradient}
               />
               <ShieldCheck color="#fff" size={normalize(60)} strokeWidth={2.5} />
               <View style={styles.arrowContainer}>
                  <TrendingUp color="#D4AF37" size={normalize(30)} strokeWidth={3} />
               </View>
            </View>
            
            <Text style={styles.logoText}>
              STOCK<Text style={{ color: '#D4AF37', fontStyle: 'italic' }}>MASTER</Text>
            </Text>
            
            <View style={styles.h1Badge}>
               <Text style={styles.h1Text}>H1_CORE</Text>
            </View>
          </Animated.View>

          {/* CINEMATIC FLASH OVERLAY */}
          <Animated.View 
            pointerEvents="none" 
            style={[styles.flashOverlay, animatedFlashStyle]} 
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  flipImage: { width: '100%', height: '100%', opacity: 0.7 },
  scanline: { position: 'absolute', width: '100%', height: 2, top: '50%' },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  goldGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.2 },
  arrowContainer: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#06060F', borderRadius: 10, padding: 5 },
  logoText: { color: '#fff', fontSize: normalize(32), fontWeight: '900', letterSpacing: -1, textTransform: 'uppercase' },
  h1Badge: { marginTop: 15, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  h1Text: { color: '#D4AF37', fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' }
});
