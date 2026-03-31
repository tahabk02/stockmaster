import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
  Dimensions,
  Alert
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  DollarSign, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  ArrowUpRight,
  ArrowLeft,
  PieChart,
  Target,
  Layers,
  Fingerprint,
  RefreshCw
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInUp, FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import api from "../api/client";
import { formatCurrency } from "../utils/format";
import { useTranslation } from "react-i18next";
import { PulseIndicator } from "../components/PulseIndicator";
import { sqliteService } from "../services/sqlite.service";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const MetricNode = ({ label, value, delta, isPositive, theme, icon }: any) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.metricWrapper}>
    <GlassCard style={styles.card} variant={theme.isDarkMode ? "dark" : "light"} intensity={20}>
      <View style={styles.metricHeader}>
         <View style={[styles.miniIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            {icon}
         </View>
         <View style={[styles.deltaBadge, { backgroundColor: isPositive ? "#10b98115" : "#ef444415" }]}>
           <Text style={[styles.deltaText, { color: isPositive ? "#10b981" : "#ef4444", ...theme.typography.pro, fontSize: 7 }]}>{delta}</Text>
         </View>
      </View>
      <Text style={[styles.metricLabel, { color: theme.colors.textLight, ...theme.typography.pro }]}>{label}</Text>
      <Text style={[styles.metricVal, { color: theme.colors.text, ...theme.typography.pro }]}>{value}</Text>
    </GlassCard>
  </TouchableOpacity>
);

export default function FinancialScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const router = useRouter();
  const { colors, isDarkMode, typography } = theme;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchFinancials = useCallback(async () => {
    try {
      const { data: res } = await api.get("financial/sync");
      if (res.success) {
        setData(res.data);
        await sqliteService.logEvent("FINANCIAL_SYNC", "SYSTEM", "Synced month-to-date financials", "INFO");
      }
    } catch (e) {
      console.error(e);
      await sqliteService.logEvent("FINANCIAL_SYNC_FAIL", "SYSTEM", "Failed to sync financial lattice", "ERROR");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const handleAction = async (type: string) => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (type === 'CLAIM') {
       router.push("/expenses");
    } else {
       Alert.alert("GATEWAY_INITIALIZED", "NEURAL_PAYMENT_BRIDGE_STBY");
    }
  };

  if (loading && !data) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
       <PulseIndicator color={colors.primary} size={40} />
       <Text style={[styles.loadingText, { color: colors.primary, ...typography.pro }]}>DECRYPTING_FISCAL_LATTICE...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. ULTRA PRO HEADER */}
      <View style={[styles.headerSection, { backgroundColor: '#000' }]}>
         <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
               <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <ArrowLeft color="#fff" size={20} />
               </TouchableOpacity>
               <Text style={[styles.headerTitle, { ...typography.pro }]}>FISCAL_COMMAND_CENTER</Text>
               <TouchableOpacity onPress={fetchFinancials} style={styles.refreshBtn}>
                  <RefreshCw color={colors.primary} size={18} />
               </TouchableOpacity>
            </View>
            <View style={styles.statusLine}>
               <View style={styles.statusGroup}>
                  <PulseIndicator color={colors.accent} size={6} />
                  <Text style={[styles.statusText, { color: colors.accent, ...typography.pro }]}>LEDGER_SYNC_OK</Text>
               </View>
               <Text style={[styles.statusText, { color: 'rgba(255,255,255,0.3)', ...typography.pro }]}>V4.2_PROTOCOL</Text>
            </View>
         </SafeAreaView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFinancials} tintColor={colors.primary} />}
      >
        {/* 2. CAPITAL ZENITH CARD */}
        <Animated.View entering={FadeInUp.delay(200)}>
           <GlassCard style={styles.mainCard} variant="dark" intensity={40}>
              <LinearGradient colors={['rgba(99,102,241,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
              <View style={styles.mainHdr}>
                 <View style={styles.mainBadge}>
                    <ShieldCheck size={10} color={colors.accent} />
                    <Text style={[styles.mainBadgeText, { ...typography.pro }]}>ASSET_BACKED_LIQUIDITY</Text>
                 </View>
                 <Fingerprint size={16} color="rgba(255,255,255,0.2)" />
              </View>
              <Text style={[styles.mainLabel, { ...typography.pro }]}>NET_POSITION_VAL</Text>
              <Text style={[styles.mainVal, { ...typography.pro }]}>{formatCurrency(data?.revenue || 0)}</Text>
              
              <View style={styles.visualTrend}>
                 {[40, 70, 55, 90, 60, 85, 100].map((h, i) => (
                    <View key={i} style={[styles.trendBar, { height: h * 0.4, backgroundColor: i === 6 ? colors.primary : 'rgba(255,255,255,0.1)' }]} />
                 ))}
              </View>

              <View style={styles.mainFooter}>
                 <View style={styles.trendRow}>
                    <TrendingUp size={12} color={colors.accent} />
                    <Text style={[styles.deltaMain, { color: colors.accent, ...typography.pro }]}>+{data?.diagnostics?.growth?.toFixed(1)}% GROWTH</Text>
                 </View>
                 <Text style={[styles.periodText, { ...typography.pro }]}>PERIOD: {data?.period}</Text>
              </View>
           </GlassCard>
        </Animated.View>

        {/* 3. FISCAL METRICS GRID */}
        <View style={styles.grid}>
           <MetricNode 
              label="GROSS_REVENUE" 
              value={formatCurrency(data?.revenue || 0)} 
              delta={`+${data?.diagnostics?.growth?.toFixed(1)}%`} 
              isPositive={true} 
              theme={theme} 
              icon={<TrendingUp size={14} color={colors.primary} />}
           />
           <MetricNode 
              label="OPERATING_BURN" 
              value={formatCurrency(data?.operatingExpenses || 0)} 
              delta="-4.2%" 
              isPositive={false} 
              theme={theme} 
              icon={<TrendingDown size={14} color={colors.danger} />}
           />
           <MetricNode 
              label="NET_MARGIN" 
              value={`${data?.diagnostics?.margin?.toFixed(1)}%`} 
              delta="+0.8%" 
              isPositive={true} 
              theme={theme} 
              icon={<PieChart size={14} color={colors.accent} />}
           />
           <MetricNode 
              label="EFFICIENCY_IDX" 
              value={`${data?.diagnostics?.efficiencyScore?.toFixed(0)}/100`} 
              delta="OPTIMAL" 
              isPositive={true} 
              theme={theme} 
              icon={<Target size={14} color={colors.warning} />}
           />
        </View>

        {/* 4. TACTICAL OPERATIONS */}
        <Text style={[styles.sectionLabel, { color: colors.textLight, ...typography.pro }]}>TACTICAL_OPERATIONS</Text>
        
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAction('CLAIM')}>
           <View style={[styles.actionIcon, { backgroundColor: colors.primary + '10' }]}>
              <Receipt size={18} color={colors.primary} />
           </View>
           <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.text, ...typography.pro }]}>EXPENSE_LEDGER</Text>
              <Text style={[styles.actionDesc, { color: colors.textLight, ...typography.pro }]}>AUDIT_AND_RECONCILE_ASSETS</Text>
           </View>
           <ArrowUpRight size={16} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleAction('PAY')}>
           <View style={[styles.actionIcon, { backgroundColor: colors.accent + '10' }]}>
              <CreditCard size={18} color={colors.accent} />
           </View>
           <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.text, ...typography.pro }]}>NEURAL_GATEWAY</Text>
              <Text style={[styles.actionDesc, { color: colors.textLight, ...typography.pro }]}>EXECUTE_FISCAL_TRANSFERS</Text>
           </View>
           <ArrowUpRight size={16} color={colors.textLight} />
        </TouchableOpacity>

        <View style={styles.securitySeal}>
           <ShieldCheck size={12} color={colors.textLight} opacity={0.3} />
           <Text style={[styles.sealText, { color: colors.textLight, ...typography.pro }]}>ENCRYPTED_FISCAL_LATTICE_V4.2</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100 },
  
  headerSection: { paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 12, letterSpacing: 2 },
  refreshBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  statusLine: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  statusGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 8, letterSpacing: 1 },

  mainCard: { padding: 24, borderRadius: 32, marginBottom: 32, overflow: 'hidden' },
  mainHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mainBadgeText: { color: '#fff', fontSize: 7, letterSpacing: 1 },
  mainLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 2 },
  mainVal: { color: '#fff', fontSize: 32, marginTop: 8 },
  
  visualTrend: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 50, marginTop: 24, paddingBottom: 5 },
  trendBar: { width: (width - 120) / 7, borderRadius: 4 },

  mainFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deltaMain: { fontSize: 9 },
  periodText: { color: 'rgba(255,255,255,0.3)', fontSize: 8 },
  
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 32 },
  metricWrapper: { width: (width - 50) / 2 },
  card: { padding: 16, borderRadius: 24 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  miniIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  metricLabel: { fontSize: 7, letterSpacing: 1, marginBottom: 4, opacity: 0.6 },
  metricVal: { fontSize: 16 },
  deltaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  
  sectionLabel: { fontSize: 9, letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionInfo: { flex: 1, marginLeft: 16 },
  actionTitle: { fontSize: 11, letterSpacing: 1 },
  actionDesc: { fontSize: 7, marginTop: 4, opacity: 0.5 },
  
  securitySeal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, opacity: 0.4 },
  sealText: { fontSize: 7, letterSpacing: 1 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 24, fontSize: 10, letterSpacing: 2 }
});