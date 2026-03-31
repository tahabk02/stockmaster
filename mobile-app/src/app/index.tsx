import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  Barcode, 
  List, 
  Package, 
  TrendingUp,
  Bell,
  Cpu,
  Activity,
  Zap,
  Globe,
  LayoutGrid,
  ShoppingCart,
  ChevronRight,
  ArrowRightLeft,
  Users,
  Truck,
  Settings,
  ShieldCheck,
  UserCheck,
  Receipt,
  MessageSquare,
  RefreshCw,
  User,
  Layers,
  Search,
  MoreVertical,
  Plus
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence 
} from "react-native-reanimated";
import { useAuthStore } from "../store/auth.store";
import * as Haptics from 'expo-haptics';
import api from "../api/client";
import { PulseIndicator } from "../components/PulseIndicator";
import { ThreeHero } from "../components/ThreeHero";
import { sqliteService } from "../services/sqlite.service";
import { GlassCard } from "../components/GlassCard";
import { LinearGradient } from 'expo-linear-gradient';

import { useTranslation } from "react-i18next";

const { width } = Dimensions.get('window');

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { user, isInitialized } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ totalItems: 0, totalStockValue: 0, lowStockCount: 0, dailyRevenue: 0 });
  const [signal, setSignal] = useState<any>(null);

  const { colors, isDarkMode, spacing, typography, roundness } = theme;

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("dashboard/stats");
      if (data.success) {
        setStats(data.data);
        setSignal(data.data.latestSignal);
      }
    } catch (e: any) {
      const localProducts = await sqliteService.getAllProducts();
      setStats({
        totalItems: localProducts.length,
        totalStockValue: localProducts.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0),
        lowStockCount: localProducts.filter((p: any) => p.quantity < 5).length,
        dailyRevenue: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) fetchStats();
  }, [isInitialized, fetchStats]);

  const handlePress = async (path: string) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
       <PulseIndicator color={colors.primary} size={normalize(40)} />
       <Text style={[styles.loadingText, { color: colors.primary, ...typography.pro }]}>INITIALIZING_CORE...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. ULTRA PRO HEADER */}
      <View style={[styles.header, { backgroundColor: '#000' }]}>
         <SafeAreaView>
            <View style={styles.headerContent}>
               <View>
                  <View style={styles.headerTopRow}>
                     <ShieldCheck color={colors.accent} size={14} />
                     <Text style={[styles.protocolLabel, { color: colors.accent, ...typography.pro }]}>PROTOCOL_MASTER_V4</Text>
                  </View>
                  <Text style={[styles.welcomeText, { color: '#fff', ...typography.pro, fontSize: normalize(20) }]}>{user?.name?.toUpperCase() || "ADMIN_UNIT"}</Text>
               </View>
               <View style={styles.headerActions}>
                  <TouchableOpacity onPress={() => handlePress("/notifications")} style={styles.headerBtn}>
                     <Bell color="#fff" size={20} />
                     <View style={[styles.badge, { backgroundColor: colors.danger }]} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePress("/profile")} style={styles.avatarBtn}>
                     <User color="#fff" size={20} />
                  </TouchableOpacity>
               </View>
            </View>
         </SafeAreaView>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} tintColor={colors.primary} />}
      >
        {/* 2. CINEMATIC ANALYTICS HERO */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
           <ThreeHero color={colors.primary} />
           <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
           
           <View style={styles.heroOverlay}>
              <View style={styles.mainStatsRow}>
                 <GlassCard variant="transparent" style={styles.mainStatCard}>
                    <Text style={[styles.statLabel, { color: colors.textLight, ...typography.pro, fontSize: 8 }]}>ASSET_TOTAL</Text>
                    <Text style={[styles.statValue, { color: '#fff', ...typography.pro, fontSize: 24 }]}>{stats.totalItems}</Text>
                    <View style={styles.trendRow}>
                       <TrendingUp size={10} color={colors.accent} />
                       <Text style={[styles.trendText, { color: colors.accent }]}>+2.4%</Text>
                    </View>
                 </GlassCard>
                 <GlassCard variant="transparent" style={styles.mainStatCard}>
                    <Text style={[styles.statLabel, { color: colors.textLight, ...typography.pro, fontSize: 8 }]}>MARKET_VAL</Text>
                    <Text style={[styles.statValue, { color: '#fff', ...typography.pro, fontSize: 24 }]}>{(stats.totalStockValue / 1000).toFixed(1)}K</Text>
                    <Text style={[styles.unitText, { color: colors.textLight }]}>MAD_PROTOCOL</Text>
                 </GlassCard>
              </View>
           </View>
        </Animated.View>

        <View style={styles.body}>
           {/* 3. NEURAL INTELLIGENCE SIGNAL */}
           <Animated.View entering={FadeIn.delay(400)}>
              <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro, marginBottom: 12 }]}>NEURAL_FEED_ACTIVE</Text>
              <GlassCard variant="primary" intensity={40} style={styles.signalCard}>
                 <View style={styles.signalHeader}>
                    <Cpu size={14} color={colors.primary} />
                    <Text style={[styles.signalStatus, { color: colors.primary, ...typography.pro }]}>LIVE_TELEMETRY</Text>
                    <View style={styles.spacer} />
                    <PulseIndicator color={colors.primary} size={6} />
                 </View>
                 <Text style={[styles.signalMsg, { color: colors.text, fontWeight: '800', fontSize: 13 }]}>
                   {signal ? `[${signal.type}] ${signal.product} - LATTICE_SYNC_SUCCESS` : "ALL_SYSTEMS_OPTIMAL_STBY"}
                 </Text>
                 <View style={styles.signalFooter}>
                    <Activity size={10} color={colors.textLight} />
                    <Text style={[styles.signalTime, { color: colors.textLight }]}>LATENCY: 14MS | CONFIDENCE: 99.8%</Text>
                 </View>
              </GlassCard>
           </Animated.View>

           {/* 4. COMMAND PROTOCOL GRID */}
           <View style={styles.protocolSection}>
              <View style={styles.sectionHeader}>
                 <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro }]}>COMMAND_PROTOCOLS</Text>
                 <TouchableOpacity style={styles.moreBtn}>
                    <MoreVertical size={16} color={colors.textLight} />
                 </TouchableOpacity>
              </View>
              
              <View style={styles.grid}>
                 <ProtocolCard 
                    title="INVENTORY" 
                    icon={<Package size={24} color={colors.primary} />} 
                    onPress={() => handlePress("/inventory")} 
                    theme={theme} 
                 />
                 <ProtocolCard 
                    title="SCANNER" 
                    icon={<Barcode size={24} color={colors.accent} />} 
                    onPress={() => handlePress("/scan")} 
                    theme={theme} 
                 />
                 <ProtocolCard 
                    title="ORDERS" 
                    icon={<ShoppingCart size={24} color={colors.warning} />} 
                    onPress={() => handlePress("/orders")} 
                    theme={theme} 
                 />
                 <ProtocolCard 
                    title="LOGISTICS" 
                    icon={<Truck size={24} color="#8b5cf6" />} 
                    onPress={() => handlePress("/logistics")} 
                    theme={theme} 
                 />
                 <ProtocolCard 
                    title="FINANCIAL" 
                    icon={<Receipt size={24} color="#f43f5e" />} 
                    onPress={() => handlePress("/expenses")} 
                    theme={theme} 
                 />
                 <ProtocolCard 
                    title="ANALYTICS" 
                    icon={<TrendingUp size={24} color="#10b981" />} 
                    onPress={() => handlePress("/analytics")} 
                    theme={theme} 
                 />
              </View>
           </View>

           {/* 5. QUICK ACCESS ASSETS */}
           <View style={styles.quickAccess}>
              <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro, marginBottom: 16 }]}>QUICK_REGISTRY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                 <QuickItem label="SUPPLIERS" icon={<Globe size={18} color="#fff" />} color="#f59e0b" onPress={() => handlePress("/suppliers")} theme={theme} />
                 <QuickItem label="CLIENTS" icon={<Users size={18} color="#fff" />} color="#06b6d4" onPress={() => handlePress("/clients")} theme={theme} />
                 <QuickItem label="PRODUCTION" icon={<Settings size={18} color="#fff" />} color="#ec4899" onPress={() => handlePress("/production")} theme={theme} />
                 <QuickItem label="QUALITY" icon={<ShieldCheck size={18} color="#fff" />} color="#10b981" onPress={() => handlePress("/quality")} theme={theme} />
              </ScrollView>
           </View>
        </View>
      </ScrollView>

      {/* 6. NEURAL NAVIGATION DOCK */}
      <View style={styles.navigationDock}>
         <GlassCard variant="dark" intensity={60} style={styles.dockInner}>
            <DockIcon icon={<LayoutGrid size={22} />} active={true} theme={theme} />
            <DockIcon icon={<Layers size={22} />} theme={theme} onPress={() => handlePress("/inventory")} />
            <TouchableOpacity style={[styles.centerScanBtn, { backgroundColor: colors.primary }]} onPress={() => handlePress("/scan")}>
               <Barcode color="#fff" size={28} />
            </TouchableOpacity>
            <DockIcon icon={<MessageSquare size={22} />} theme={theme} onPress={() => handlePress("/chat")} />
            <DockIcon icon={<Settings size={22} />} theme={theme} onPress={() => handlePress("/profile")} />
         </GlassCard>
      </View>
    </View>
  );
}

const ProtocolCard = ({ title, icon, onPress, theme }: any) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withTiming(1.05, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9} 
      style={styles.protocolCardWrapper}
    >
      <Animated.View style={animatedStyle}>
        <GlassCard variant="transparent" intensity={15} style={styles.protocolCard}>
          <View style={[styles.protocolIconBox, { borderColor: theme.colors.border + '20', borderWidth: 1 }]}>{icon}</View>
          <Text style={[styles.protocolTitle, { color: theme.colors.text, ...theme.typography.pro, fontSize: 8 }]}>{title}</Text>
          <View style={[styles.cardPulse, { backgroundColor: theme.colors.primary + '20' }]}>
             <PulseIndicator color={theme.colors.primary} size={4} />
          </View>
        </GlassCard>
      </Animated.View>
    </TouchableOpacity>
  );
};

const QuickItem = ({ label, icon, color, onPress, theme }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.quickItemWrapper}>
     <View style={[styles.quickIcon, { backgroundColor: color }]}>{icon}</View>
     <Text style={[styles.quickLabel, { ...theme.typography.pro, fontSize: 8 }]}>{label}</Text>
  </TouchableOpacity>
);

const DockIcon = ({ icon, active, theme, onPress }: any) => (
  <TouchableOpacity style={styles.dockIcon} onPress={onPress}>
    {React.cloneElement(icon, { color: active ? theme.colors.primary : '#fff', opacity: active ? 1 : 0.4 })}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, letterSpacing: 2 },
  
  header: { paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 10 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  protocolLabel: { fontSize: 8, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  badge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: '#000' },
  
  heroSection: { height: 280, marginTop: -20, zIndex: -1 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 24, paddingBottom: 40 },
  mainStatsRow: { flexDirection: 'row', gap: 12 },
  mainStatCard: { flex: 1, padding: 16, borderRadius: 24 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trendText: { fontSize: 10, fontWeight: '900' },
  unitText: { fontSize: 7, fontWeight: '900', marginTop: 4, opacity: 0.5 },
  
  body: { paddingHorizontal: 24, marginTop: -20 },
  sectionTitle: { fontSize: 10, letterSpacing: 2 },
  signalCard: { borderRadius: 24, padding: 16 },
  signalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  signalStatus: { fontSize: 9, letterSpacing: 1 },
  spacer: { flex: 1 },
  signalFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, opacity: 0.4 },
  signalTime: { fontSize: 8, fontWeight: '900' },
  
  protocolSection: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  protocolCardWrapper: { width: (width - 48 - 20) / 3 },
  protocolCard: { height: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 24 },
  protocolIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  protocolTitle: { letterSpacing: 1 },
  cardPulse: { position: 'absolute', top: 12, right: 12, width: 12, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  quickAccess: { marginTop: 32 },

  horizontalScroll: { gap: 20, paddingRight: 40 },
  quickItemWrapper: { alignItems: 'center', gap: 8 },
  quickIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  quickLabel: { letterSpacing: 1, opacity: 0.6 },
  
  navigationDock: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  dockInner: { height: 72, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderRadius: 36, paddingHorizontal: 10 },
  dockIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  centerScanBtn: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: -40, shadowOpacity: 0.5, shadowRadius: 15, elevation: 20, borderWidth: 4, borderColor: 'rgba(2, 6, 23, 0.8)' }
});
