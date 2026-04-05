import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import {
  Package,
  Activity,
  Zap,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Cpu,
  Search,
  ChevronRight,
  Truck,
  Receipt,
  BarChart3,
  Shield,
  LayoutGrid,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import { ImageDetailModal } from "../components/ImageDetailModal";
import { sqliteService } from "../services/sqlite.service";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const FeatureCard = ({ num, title, subtitle, icon: Icon, image, onPress, large }: any) => {
  const { colors, typography } = useAppTheme();
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      style={[styles.featureCardWrapper, large && { width: '100%' }]}
    >
      <GlassCard variant="transparent" intensity={35} style={[styles.featureGlass, large && { height: 160 }]}>
        <Image source={{ uri: image }} style={styles.featureImage} />
        <LinearGradient
          colors={["rgba(2, 6, 23, 0.95)", "rgba(2, 6, 23, 0.2)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.featureContent}>
          <View style={styles.featureTop}>
             <Text style={[styles.featureNum, typography.pro]}>{num}</Text>
             <View style={styles.featureIconWrapper}>
                <Icon size={16} color={colors.primary} />
             </View>
          </div>
          <View>
            <Text style={[styles.featureTitle, typography.pro, { color: colors.white }]}>{title}</Text>
            <Text style={[styles.featureSubtitle, { color: colors.textLight }]}>{subtitle}</Text>
          </div>
        </View>
        
        {/* Decorative corner */}
        <View style={[styles.cardCorner, { borderTopColor: colors.primary, borderLeftColor: colors.primary }]} />
      </GlassCard>
    </TouchableOpacity>
  );
};

const QuickAction = ({ icon: Icon, label, color, onPress }: any) => {
  const { colors, typography } = useAppTheme();
  return (
    <TouchableOpacity 
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }} 
      style={styles.quickActionItem}
    >
      <GlassCard variant="transparent" intensity={40} style={styles.quickActionGlass}>
        <Icon size={22} color={color} />
        <View style={[styles.quickActionPulse, { backgroundColor: color }]} />
      </GlassCard>
      <Text style={[styles.quickActionLabel, typography.pro, { color: colors.white }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const HomeScreen = () => {
  const { colors, typography, isDarkMode } = useAppTheme();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({ total: 0, lowStock: 0, pending: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const openAsset = (asset: any) => {
    setSelectedAsset(asset);
    setModalVisible(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    const loadData = async () => {
      const products = await sqliteService.getAllProducts();
      const pending = await sqliteService.getPendingTransactions();
      const logs = await sqliteService.getAuditLogs(5);
      
      const low = products.filter((p: any) => p.quantity < 5).length;
      
      setStats({
        total: products.length,
        lowStock: low,
        pending: pending.length
      });
      setRecentLogs(logs);
    };

    loadData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <ImageDetailModal 
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        {...selectedAsset}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. CINEMATIC HERO SECTION */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200" }} 
            style={StyleSheet.absoluteFill} 
          />
          <LinearGradient
            colors={["rgba(2, 6, 23, 0.1)", "rgba(2, 6, 23, 0.8)", "rgba(2, 6, 23, 1)"]}
            style={StyleSheet.absoluteFill}
          />
          
          <SafeAreaView style={styles.heroOverlay}>
            <Animated.View entering={FadeInDown.duration(1000)} style={styles.heroContent}>
              <View style={styles.topNav}>
                <View style={styles.badgeWrapper}>
                  <PulseIndicator color={colors.primary} size={6} />
                  <Text style={[styles.badgeText, typography.pro]}>CORE_NODE_v4.2.0</Text>
                </View>
                <TouchableOpacity onPress={() => {}}>
                  <GlassCard variant="transparent" intensity={30} style={styles.profileBtn}>
                    <LayoutGrid size={18} color={colors.white} />
                  </GlassCard>
                </TouchableOpacity>
              </View>
              
              <View style={styles.titleWrapper}>
                <Text style={[styles.heroTitle, typography.pro]}>
                  <Text style={{ opacity: 0.1, fontSize: 32 }}>ENTERPRISE</Text>{"\n"}
                  <Text style={{ color: colors.primary }}>COMMAND</Text>{"\n"}
                  <Text>CENTER.</Text>
                </Text>
              </View>

              <View style={styles.heroActions}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate("Scan")}
                >
                  <LinearGradient
                    colors={[colors.primary, "#4338ca"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.primaryBtnText, typography.pro]}>INITIALISER_NODE ↗</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* 2. DIRECTIVE DOCK (Floating) */}
        <View style={styles.directiveDock}>
          <GlassCard variant="transparent" intensity={20} style={styles.dockGlass}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dockScroll}>
              <QuickAction icon={Scan} label="SCAN" color={colors.primary} onPress={() => navigation.navigate("Scan")} />
              <QuickAction icon={RefreshCw} label="SYNC" color={colors.accent} onPress={() => navigation.navigate("Sync")} />
              <QuickAction icon={Box} label="INV" color={colors.warning} onPress={() => {}} />
              <QuickAction icon={Truck} label="FLEET" color={colors.danger} onPress={() => {}} />
              <QuickAction icon={BarChart3} label="INTEL" color={colors.primary} onPress={() => {}} />
            </ScrollView>
          </GlassCard>
        </View>

        {/* 3. METRIC LATTICE (Stats) */}
        <View style={styles.latticeSection}>
           <View style={styles.sectionHeader}>
            <Text style={[styles.miniLabel, typography.pro, { color: colors.textLight }]}>// METRIC_LATTICE</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.latticeScroll}>
            {[
              { l: "ARTICLES", v: stats.total, d: "↑ 12%", color: colors.primary },
              { l: "PENDING", v: stats.pending, d: "ACTIVE", color: colors.accent },
              { l: "HEALTH", v: "99.9%", d: "STABLE", color: colors.warning },
              { l: "ALERTS", v: stats.lowStock, d: "SIGNAL", color: colors.danger }
            ].map((stat, i) => (
              <GlassCard key={i} variant="transparent" intensity={15} style={styles.latticeItem}>
                <View style={[styles.latticeIndicator, { backgroundColor: stat.color }]} />
                <Text style={[styles.latticeLabel, typography.pro]}>{stat.l}</Text>
                <Text style={[styles.latticeValue, typography.pro, { color: colors.white }]}>{stat.v}</Text>
                <Text style={[styles.latticeDelta, typography.pro, { color: stat.color }]}>{stat.d}</Text>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* 4. CORE PROTOCOLS (Bento) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelWrapper}>
              <PulseIndicator color={colors.primary} size={4} />
              <Text style={[styles.sectionLabel, typography.pro]}>CORE_PROTOCOLS</Text>
            </View>
            <Text style={[styles.sectionTitle, typography.pro, { color: colors.white }]}>CAPACITÉS <Text style={{ color: colors.primary }}>SYSTÈME.</Text></Text>
          </View>

          <View style={styles.bentoGrid}>
            <FeatureCard 
              num="01" 
              title="INVENTAIRE" 
              subtitle="Gestion matricielle." 
              icon={Package} 
              image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600"
              onPress={() => {}}
              large
            />
            <FeatureCard 
              num="02" 
              title="PARTENAIRES" 
              subtitle="Registre CRM." 
              icon={Truck} 
              image="https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=600"
              onPress={() => {}}
            />
            <FeatureCard 
              num="03" 
              title="FINANCES" 
              subtitle="Flux chiffrés." 
              icon={Receipt} 
              image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* 5. LIVE FORENSICS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelWrapper}>
              <PulseIndicator color={colors.danger} size={4} />
              <Text style={[styles.sectionLabel, typography.pro]}>FORENSIC_STREAM</Text>
            </View>
            <Text style={[styles.sectionTitle, typography.pro, { color: colors.white }]}>FEED <Text style={{ color: colors.primary }}>REALTIME.</Text></Text>
          </View>

          {recentLogs.map((log, i) => (
            <GlassCard key={i} variant="transparent" intensity={15} style={styles.logGlass}>
              <View style={[styles.logIndicator, { backgroundColor: colors.primary }]} />
              <View style={styles.logBody}>
                <Text style={[styles.logTitle, typography.pro, { color: colors.white }]}>{log.event}</Text>
                <Text style={[styles.logMeta, { color: colors.textLight }]}>{log.details}</Text>
              </View>
              <View style={styles.logStatus}>
                 <Text style={[styles.logTime, typography.pro]}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                 <View style={[styles.logPulse, { backgroundColor: colors.primary }]} />
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
  },
  heroSection: {
    height: height * 0.65,
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 25,
  },
  heroContent: {
    marginBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  badgeText: {
    color: '#818CF8',
    fontSize: 10,
  },
  profileBtn: {
    padding: 10,
    borderRadius: 15,
  },
  titleWrapper: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 48,
    color: '#fff',
    lineHeight: 44,
  },
  heroActions: {
    flexDirection: 'row',
  },
  primaryBtn: {
    paddingHorizontal: 35,
    paddingVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  directiveDock: {
    paddingHorizontal: 20,
    marginTop: -30,
    zIndex: 10,
  },
  dockGlass: {
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dockScroll: {
    gap: 20,
    paddingHorizontal: 10,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionGlass: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    position: 'relative',
  },
  quickActionPulse: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  quickActionLabel: {
    fontSize: 8,
    letterSpacing: 1,
  },
  latticeSection: {
    padding: 20,
    paddingTop: 40,
  },
  miniLabel: {
    fontSize: 10,
    marginBottom: 20,
    letterSpacing: 2,
    opacity: 0.5,
  },
  latticeScroll: {
    gap: 12,
  },
  latticeItem: {
    width: 120,
    padding: 20,
    borderRadius: 25,
  },
  latticeIndicator: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  latticeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 5,
  },
  latticeValue: {
    fontSize: 24,
    marginBottom: 5,
  },
  latticeDelta: {
    fontSize: 9,
  },
  section: {
    padding: 20,
    paddingTop: 40,
  },
  sectionHeader: {
    marginBottom: 25,
  },
  sectionLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#818cf8',
    fontSize: 10,
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 32,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCardWrapper: {
    width: (width - 52) / 2,
  },
  featureGlass: {
    height: 180,
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 15,
    height: 15,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    opacity: 0.5,
  },
  featureImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  featureContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  featureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featureNum: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 14,
  },
  featureIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 10,
    lineHeight: 14,
  },
  logGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 12,
    borderRadius: 25,
    gap: 18,
  },
  logIndicator: {
    width: 3,
    height: 35,
    borderRadius: 2,
  },
  logBody: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  logMeta: {
    fontSize: 11,
    opacity: 0.6,
  },
  logStatus: {
    alignItems: 'center',
    gap: 6,
  },
  logTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  logPulse: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
