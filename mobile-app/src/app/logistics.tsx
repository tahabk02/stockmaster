import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
  StatusBar,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Globe, 
  Activity, 
  ChevronRight, 
  Package, 
  Clock, 
  Shield, 
  Zap,
  ArrowUpRight,
  Fingerprint,
  Box,
  LayoutGrid,
  Search,
  ArrowLeft,
  RefreshCw as RefreshIcon
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { sqliteService } from "../services/sqlite.service";
import { PulseIndicator } from "../components/PulseIndicator";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const DeliveryNode = ({ item, theme, t, onUpdate }: any) => {
  const isCritical = item.priority === "CRITICAL" || item.priority === "HIGH";
  const progress = item.status === "DELIVERED" ? 100 : item.status === "IN_TRANSIT" ? 65 : item.status === "PROCESSING" ? 30 : 5;

  return (
    <TouchableOpacity 
       activeOpacity={0.9} 
       style={styles.cardWrapper}
       onPress={() => onUpdate(item)}
    >
      <GlassCard 
        style={[styles.card, { borderLeftColor: isCritical ? theme.colors.danger : theme.colors.primary }]} 
        variant={theme.isDarkMode ? "dark" : "light"}
        intensity={30}
      >
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <View style={[styles.nodeIcon, { backgroundColor: theme.colors.primary + '20' }]}>
               <Fingerprint size={12} color={theme.colors.primary} />
            </View>
            <Text style={[styles.idText, { color: theme.colors.text, ...theme.typography.pro }]}>NODE_{item.trackingNumber?.substr(-6)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isCritical ? theme.colors.danger + '10' : theme.colors.accent + '10' }]}>
             <PulseIndicator color={isCritical ? theme.colors.danger : theme.colors.accent} size={4} />
             <Text style={[styles.statusText, { color: isCritical ? theme.colors.danger : theme.colors.accent, ...theme.typography.pro }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Text style={[styles.routeLabel, { color: theme.colors.textLight, ...theme.typography.pro }]}>ORIGIN</Text>
            <Text style={[styles.locationName, { color: theme.colors.text }]}>NEURAL_HUB</Text>
          </View>
          <View style={styles.routeLine}>
             <View style={[styles.routeProgress, { width: `${progress}%`, backgroundColor: isCritical ? theme.colors.danger : theme.colors.primary }]} />
             <Animated.View style={[styles.transitIcon, { left: `${progress}%` }]}>
                <Zap size={10} color={isCritical ? theme.colors.danger : theme.colors.primary} fill={isCritical ? theme.colors.danger : theme.colors.primary} />
             </Animated.View>
          </View>
          <View style={styles.routePoint}>
            <Text style={[styles.routeLabel, { color: theme.colors.textLight, ...theme.typography.pro, textAlign: 'right' }]}>TARGET</Text>
            <Text style={[styles.locationName, { color: theme.colors.text, textAlign: 'right' }]}>{item.destination?.city?.toUpperCase() || "UNKNOWN"}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
           <View style={styles.metaItem}>
              <Clock size={10} color={theme.colors.textLight} />
              <Text style={[styles.metaText, { color: theme.colors.textLight, ...theme.typography.pro }]}>ETA: <Text style={{ color: theme.colors.text }}>T+4H</Text></Text>
           </View>
           <View style={styles.metaItem}>
              <Box size={10} color={theme.colors.textLight} />
              <Text style={[styles.metaText, { color: theme.colors.textLight, ...theme.typography.pro }]}>PRIORITY: <Text style={{ color: isCritical ? theme.colors.danger : theme.colors.accent }}>{item.priority}</Text></Text>
           </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

export default function LogisticsScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const router = useRouter();
  const { colors, typography } = theme;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, transit: 0, efficiency: "98.4%" });

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
    fetchDeliveries();
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.5]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.6, 0])
  }));

  const fetchDeliveries = async () => {
    try {
      const { data } = await api.get("logistics/deliveries");
      if (data.success) {
        setDeliveries(data.data);
        setStats({
          active: data.data.length,
          transit: data.data.filter((d: any) => d.status === "IN_TRANSIT").length,
          efficiency: "99.2%"
        });
        await sqliteService.logEvent("LOGISTICS_SYNC", "SYSTEM", `Synced ${data.data.length} deliveries`, "INFO");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = (item: any) => {
    Alert.alert(
      "PROTOCOL_UPDATE",
      `UPDATE STATUS FOR NODE_${item.trackingNumber?.substr(-6)}`,
      [
        { text: "ABORT", style: "cancel" },
        { text: "MARK_IN_TRANSIT", onPress: () => updateStatus(item._id, "IN_TRANSIT") },
        { text: "MARK_DELIVERED", onPress: () => updateStatus(item._id, "DELIVERED"), style: "destructive" }
      ]
    );
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { data } = await api.put(`logistics/deliveries/${id}/status`, { status });
      if (data.success) {
        fetchDeliveries();
        await sqliteService.logEvent("DELIVERY_UPDATE", "USER", `Node ${id} updated to ${status}`, "INFO");
      }
    } catch (e) {
      Alert.alert("SYNC_FAILURE", "COULD NOT UPDATE NEURAL NODE");
    }
  };

  const handleDispatch = async () => {
     if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
     router.push("/orders");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: '#000' }]}>
         <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
               <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <ArrowLeft color="#fff" size={20} />
               </TouchableOpacity>
               <Text style={[styles.headerTitle, { ...typography.pro }]}>LOGISTICS_COMMAND_CORE</Text>
               <TouchableOpacity onPress={fetchDeliveries} style={styles.refreshBtn}>
                  <RefreshIcon color={colors.primary} size={20} />
               </TouchableOpacity>
            </View>
            <View style={styles.telemeryRow}>
               <View style={styles.telemetryItem}>
                  <PulseIndicator color={colors.accent} size={6} />
                  <Text style={[styles.telemetryText, { color: colors.accent, ...typography.pro }]}>UPLINK_ACTIVE</Text>
               </View>
               <Text style={[styles.telemetryText, { color: 'rgba(255,255,255,0.3)', ...typography.pro }]}>SECURE_CHANNEL_V4</Text>
            </View>
         </SafeAreaView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDeliveries} tintColor={colors.primary} />}
      >
        <View style={styles.mapSection}>
           <View style={[styles.mapPlaceholder, { backgroundColor: '#020617' }]}>
              <LinearGradient colors={['rgba(99,102,241,0.05)', 'transparent']} style={StyleSheet.absoluteFill} />
              <View style={styles.gridOverlay}>
                 {[...Array(6)].map((_, i) => <View key={i} style={styles.gridLineV} />)}
              </View>
              <View style={styles.mapTarget}>
                 <Animated.View style={[styles.pulseCircle, { borderColor: colors.primary }, animatedPulseStyle]} />
                 <View style={[styles.targetCore, { backgroundColor: colors.primary }]}>
                    <Navigation size={12} color="#fff" />
                 </View>
              </View>
              <View style={styles.mapTelemetry}>
                 <Text style={[styles.cords, { color: colors.primary, ...typography.pro }]}>LAT: 34.0522°N</Text>
                 <Text style={[styles.cords, { color: colors.primary, ...typography.pro }]}>LNG: 118.2437°W</Text>
              </View>
              <View style={styles.mapBadge}>
                 <Shield size={10} color={colors.accent} />
                 <Text style={[styles.mapBadgeText, { color: colors.accent, ...typography.pro }]}>GEOSPATIAL_SYNC_OK</Text>
              </View>
           </View>
        </View>

        <View style={styles.statsGrid}>
           <GlassCard style={styles.statBox} variant="dark">
              <Truck size={14} color={colors.primary} />
              <Text style={[styles.statVal, { ...typography.pro }]}>{stats.active}</Text>
              <Text style={[styles.statLabel, { ...typography.pro }]}>ACTIVE_NODES</Text>
           </GlassCard>
           <GlassCard style={styles.statBox} variant="dark">
              <Navigation size={14} color={colors.accent} />
              <Text style={[styles.statVal, { ...typography.pro }]}>{stats.transit}</Text>
              <Text style={[styles.statLabel, { ...typography.pro }]}>IN_TRANSIT</Text>
           </GlassCard>
           <GlassCard style={styles.statBox} variant="dark">
              <Zap size={14} color={colors.warning} />
              <Text style={[styles.statVal, { ...typography.pro }]}>{stats.efficiency}</Text>
              <Text style={[styles.statLabel, { ...typography.pro }]}>EFFICIENCY</Text>
           </GlassCard>
        </View>

        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro }]}>ACTIVE_TRANSIT_FEED</Text>
           <View style={styles.liveIndicator}>
              <PulseIndicator color={colors.danger} size={6} />
              <Text style={[styles.liveText, { color: colors.danger, ...typography.pro }]}>LIVE</Text>
           </View>
        </View>

        {loading ? (
           <View style={styles.loader}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.primary, ...typography.pro }]}>SCANNING_FLEET_DATA...</Text>
           </View>
        ) : (
          deliveries.map((delivery, i) => (
            <Animated.View key={delivery._id} entering={FadeInDown.delay(i * 100).springify()}>
               <DeliveryNode item={delivery} theme={theme} t={t} onUpdate={handleUpdateStatus} />
            </Animated.View>
          ))
        )}

        {deliveries.length === 0 && !loading && (
           <View style={styles.emptyContainer}>
              <Box size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textLight, ...typography.pro }]}>NO_ACTIVE_DELIVERIES_DETECTED</Text>
           </View>
        )}

        <TouchableOpacity 
           style={[styles.dispatchBtn, { backgroundColor: colors.primary }]} 
           onPress={handleDispatch}
           activeOpacity={0.8}
        >
           <Text style={[styles.dispatchText, { ...typography.pro }]}>INITIALIZE_NEW_DISPATCH</Text>
           <ArrowUpRight size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120 },
  header: { paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 12, letterSpacing: 2 },
  refreshBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  telemeryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  telemetryItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  telemetryText: { fontSize: 8, letterSpacing: 1 },
  mapSection: { height: 200, borderRadius: 28, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'space-around' },
  gridLineV: { width: 1, height: '100%', backgroundColor: 'rgba(99,102,241,0.05)' },
  mapTarget: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  pulseCircle: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  targetCore: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  mapTelemetry: { position: 'absolute', bottom: 15, right: 15, alignItems: 'flex-end' },
  cords: { fontSize: 8, letterSpacing: 1, opacity: 0.5 },
  mapBadge: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapBadgeText: { fontSize: 7, letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  statBox: { flex: 1, padding: 12, alignItems: 'center', gap: 4, borderRadius: 20 },
  statVal: { color: '#fff', fontSize: 16 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 6, letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 9, letterSpacing: 2 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { fontSize: 8, letterSpacing: 1 },
  cardWrapper: { marginBottom: 16 },
  card: { borderRadius: 24, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nodeIcon: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  idText: { fontSize: 10, letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 7 },
  routeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  routePoint: { flex: 1 },
  routeLabel: { fontSize: 7, letterSpacing: 1, marginBottom: 4, opacity: 0.4 },
  locationName: { fontSize: 11, fontWeight: '900' },
  routeLine: { flex: 2, height: 2, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 15, borderRadius: 1, justifyContent: 'center' },
  routeProgress: { height: '100%', borderRadius: 1 },
  transitIcon: { position: 'absolute', top: -4, marginLeft: -5 },
  metaRow: { flexDirection: 'row', gap: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.03)' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 8, letterSpacing: 0.5 },
  loader: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 10, letterSpacing: 2 },
  emptyContainer: { padding: 40, alignItems: 'center', gap: 12, opacity: 0.5 },
  emptyText: { fontSize: 9, letterSpacing: 1 },
  dispatchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 60, borderRadius: 20, marginTop: 10 },
  dispatchText: { color: '#fff', fontSize: 11, letterSpacing: 2 }
});