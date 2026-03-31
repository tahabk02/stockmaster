import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme, normalize } from "../theme";
import { 
  Search, 
  Package, 
  ChevronRight, 
  Filter, 
  Zap,
  ArrowLeft,
  Database,
  Box,
  Fingerprint,
  Cpu,
  MoreVertical,
  Activity,
  Layers,
  ArrowUpRight
} from "lucide-react-native";
import { useRouter } from "expo-router";
import api from "../api/client";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { sqliteService } from "../services/sqlite.service";
import { useTranslation } from "react-i18next";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function InventoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode, spacing, typography } = theme;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get("products");
      if (data.success) {
        setProducts(data.data || []);
        setIsOffline(false);
        if (Platform.OS !== 'web') {
           for (const p of data.data) await sqliteService.upsertProduct(p);
        }
      }
    } catch (e) {
      setIsOffline(true);
      const local = await sqliteService.getAllProducts();
      setProducts(local || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const renderItem = ({ item, index }: any) => {
    const isCritical = item.quantity < 5;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(12)}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: "/details", params: { id: item._id || item.sku } })}
          style={styles.cardWrapper}
        >
          <GlassCard 
            variant={isDarkMode ? "dark" : "light"} 
            intensity={isDarkMode ? 30 : 60}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
               <View style={styles.idSection}>
                  <View style={[styles.nodeIcon, { backgroundColor: colors.primary + '20' }]}>
                     <Fingerprint size={12} color={colors.primary} />
                  </View>
                  <Text style={[styles.skuCode, { color: colors.textLight, ...typography.pro }]}>NODE_{item.sku || "UNASSIGNED"}</Text>
               </View>
               <View style={[styles.statusBadge, { backgroundColor: isCritical ? colors.danger + '10' : colors.accent + '10' }]}>
                  <PulseIndicator color={isCritical ? colors.danger : colors.accent} size={4} />
                  <Text style={[styles.statusText, { color: isCritical ? colors.danger : colors.accent, ...typography.pro }]}>
                    {isCritical ? "CRITICAL_LVL" : "STATUS_NOMINAL"}
                  </Text>
               </View>
            </View>

            <View style={styles.assetInfo}>
               <Text style={[styles.assetName, { color: colors.text, ...typography.pro }]} numberOfLines={1}>{item.name}</Text>
               <Text style={[styles.categoryText, { color: colors.textLight, ...typography.pro, fontSize: 8, opacity: 0.5 }]}>
                  PATH: {item.category?.name?.toUpperCase() || "ROOT_DIRECTORY"}
               </Text>
            </View>
            
            <View style={styles.metricsGrid}>
               <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textLight, ...typography.pro }]}>QUANTITY</Text>
                  <View style={styles.valueRow}>
                     <Layers size={12} color={colors.primary} />
                     <Text style={[styles.metricValue, { color: colors.text, ...typography.pro }]}>{item.quantity}</Text>
                     <Text style={[styles.unitLabel, { color: colors.textLight }]}>UNITS</Text>
                  </View>
               </View>
               <View style={styles.metricDivider} />
               <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textLight, ...typography.pro }]}>UNIT_VAL</Text>
                  <View style={styles.valueRow}>
                     <Activity size={12} color={colors.accent} />
                     <Text style={[styles.metricValue, { color: colors.text, ...typography.pro }]}>{Number(item.price).toFixed(0)}</Text>
                     <Text style={[styles.unitLabel, { color: colors.textLight }]}>MAD</Text>
                  </View>
               </View>
            </View>

            <View style={styles.cardFooter}>
               <View style={styles.syncStatus}>
                  <Zap size={10} color={colors.primary} fill={colors.primary} />
                  <Text style={[styles.syncText, { color: colors.primary, ...typography.pro }]}>LATTICE_SYNC: ACTIVE</Text>
               </View>
               <View style={styles.actionCircle}>
                  <ArrowUpRight size={14} color={colors.primary} />
               </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. SEARCH PROTOCOL HEADER */}
      <View style={[styles.header, { backgroundColor: '#000' }]}>
         <SafeAreaView>
            <View style={styles.headerTop}>
               <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <ArrowLeft color="#fff" size={20} />
               </TouchableOpacity>
               <Text style={[styles.headerTitle, { ...typography.pro }]}>INVENTORY_REGISTRY</Text>
               <TouchableOpacity style={styles.optionsBtn}>
                  <MoreVertical color="#fff" size={20} />
               </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
               <GlassCard variant="transparent" intensity={10} style={styles.searchGlass}>
                  <Search size={18} color="rgba(255,255,255,0.4)" />
                  <TextInput
                     placeholder="SEARCH_ASSET_INDEX..."
                     placeholderTextColor="rgba(255,255,255,0.2)"
                     value={search}
                     onChangeText={setSearch}
                     style={[styles.searchInput, { ...typography.pro }]}
                  />
                  <TouchableOpacity style={styles.filterBtn}>
                     <Filter size={16} color={colors.primary} />
                  </TouchableOpacity>
               </GlassCard>
            </View>
         </SafeAreaView>
      </View>

      {loading ? (
        <View style={styles.center}>
           <PulseIndicator color={colors.primary} size={40} />
           <Text style={[styles.loadingText, { color: colors.primary, ...typography.pro }]}>SCANNING_DATA_LATTICE...</Text>
        </View>
      ) : (
        <FlatList
          data={products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || item.sku}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={() => (
             <View style={styles.listHeader}>
                <Text style={[styles.resultsCount, { color: colors.textLight, ...typography.pro }]}>
                   ENTRIES_FOUND: {products.length}
                </Text>
                {isOffline && (
                   <View style={styles.offlineBadge}>
                      <Database size={10} color={colors.warning} />
                      <Text style={[styles.offlineText, { color: colors.warning, ...typography.pro }]}>LOCAL_CACHE_MODE</Text>
                   </View>
                )}
             </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <Box size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.text, ...typography.pro }]}>NO_ASSETS_DETECTED</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontSize: 10, letterSpacing: 2 },
  
  header: { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, letterSpacing: 2 },
  optionsBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  
  searchContainer: { paddingHorizontal: 20 },
  searchGlass: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 16, borderBlockColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, marginLeft: 12, color: '#fff', fontSize: 10, letterSpacing: 1 },
  filterBtn: { padding: 5 },
  
  list: { padding: 20, paddingBottom: 100 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  resultsCount: { fontSize: 8, letterSpacing: 1 },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  offlineText: { fontSize: 7, letterSpacing: 0.5 },
  
  cardWrapper: { marginBottom: 16 },
  card: { borderRadius: 28 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  idSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nodeIcon: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  skuCode: { fontSize: 8, letterSpacing: 1, opacity: 0.6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 7, letterSpacing: 0.5 },
  
  assetInfo: { marginBottom: 20 },
  assetName: { fontSize: 18, letterSpacing: 0.5, marginBottom: 4 },
  categoryText: { opacity: 0.4 },
  
  metricsGrid: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.02)', padding: 16, borderRadius: 20, marginBottom: 16 },
  metricItem: { flex: 1 },
  metricLabel: { fontSize: 7, letterSpacing: 1, marginBottom: 6, opacity: 0.4 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricValue: { fontSize: 16 },
  unitLabel: { fontSize: 8, opacity: 0.4, marginTop: 4 },
  metricDivider: { width: 1, height: '80%', backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 15, alignSelf: 'center' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  syncStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.6 },
  syncText: { fontSize: 7, letterSpacing: 1 },
  actionCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
  
  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: 10, letterSpacing: 2, opacity: 0.5 }
});
