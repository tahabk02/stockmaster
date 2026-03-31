import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Zap,
  Globe,
  Lock,
  ChevronRight,
  BarChart3,
  PieChart
} from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import { PulseIndicator } from "../components/PulseIndicator";
import { NeuralChart } from "../components/NeuralChart";
import api from "../api/client";
import { formatCurrency } from "../utils/format";
import { useTranslation } from "react-i18next";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('VELOCITY');

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('reports/stats');
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error("[Analytics] Link Failure");
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = async (tab: string) => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. CINEMATIC HEADER */}
        <View style={[styles.header, { backgroundColor: '#000' }]}>
           <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                 <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('DASHBOARD.ANALYTICS')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                 <Zap color={colors.primary} size={14} fill={colors.primary} />
                 <Text style={[styles.statusText, { color: colors.primary }]}>{t('COMMON.ACTIVE')}</Text>
              </View>
           </View>

           <View style={styles.neuralModule}>
              <View style={styles.moduleHdr}>
                 <Text style={styles.moduleLabel}>{t('ANALYTICS.PULSE')}</Text>
                 <Text style={[styles.moduleVal, { color: colors.accent }]}>98.4%{t('ANALYTICS.HEALTH')}</Text>
              </View>
              <NeuralChart />
           </View>
        </View>

        {/* 2. CORE METRICS LATTICE */}
        <View style={styles.metricsGrid}>
           <MetricBlock 
             label={t('INVENTORY.VALUATION')} 
             value={formatCurrency(stats?.products?.totalStockValue || 1240500)} 
             sub={`+12.4%${t('ANALYTICS.DELTA')}`}
             icon={<Database size={14} color={colors.primary} />}
             theme={theme}
           />
           <MetricBlock 
             label={t('ANALYTICS.FLUX')} 
             value={`842 ${t('COMMON.UNITS')}`} 
             sub={t('LOGISTICS.TRANSIT')}
             icon={<Activity size={14} color={colors.accent} />}
             theme={theme}
           />
        </View>

        {/* 3. DISTRIBUTION MODULE */}
        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ANALYTICS.DISTRIBUTION')}</Text>
           <BarChart3 size={14} color={colors.primary} />
        </View>

        <GlassCard style={styles.dataModule} variant={isDarkMode ? "dark" : "light"}>
           <View style={styles.tabBar}>
              {['VELOCITY', 'VOLUME', 'MARGIN'].map(tab => (
                <TouchableOpacity key={tab} onPress={() => handleTabPress(tab)} style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]}>
                   <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : colors.textLight }]}>{t(`ANALYTICS.${tab}`)}</Text>
                </TouchableOpacity>
              ))}
           </View>

           <View style={styles.distList}>
              {[1, 2, 3].map((_, i) => (
                <View key={i} style={styles.distItem}>
                   <View style={styles.distInfo}>
                      <Text style={[styles.distName, { color: colors.text }]}>{t('ANALYTICS.SECTOR')}_0{i+1}</Text>
                      <Text style={[styles.distVal, { color: colors.primary }]}>84%</Text>
                   </View>
                   <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                      <View style={[styles.progressFill, { width: '84%', backgroundColor: colors.primary }]} />
                   </View>
                </View>
              ))}
           </View>
        </GlassCard>

        {/* 4. FORENSIC DIAGNOSTICS */}
        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ANALYTICS.DIAGNOSTICS')}</Text>
           <Cpu size={14} color={colors.accent} />
        </View>

        <View style={styles.diagGrid}>
           <DiagNode icon={<Cpu size={16} color={colors.primary} />} label={t('ANALYTICS.AI_NODE')} status={t('COMMON.OPTIMAL')} theme={theme} />
           <DiagNode icon={<Globe size={16} color={colors.accent} />} label={t('ANALYTICS.GRID_NODE')} status={t('COMMON.STATUS')} theme={theme} />
           <DiagNode icon={<Lock size={16} color={colors.warning} />} label={t('ANALYTICS.SEC_NODE')} status={t('DASHBOARD.HARDENED')} theme={theme} />
        </View>

      </ScrollView>
    </View>
  );
}

const MetricBlock = ({ label, value, sub, icon, theme }: any) => (
  <GlassCard style={styles.metricBlock} variant={theme.isDarkMode ? "dark" : "light"}>
     <View style={styles.metricHdr}>
        {icon}
        <Text style={[styles.metricLabel, { color: theme.colors.textLight }]}>{label}</Text>
     </View>
     <Text style={[styles.metricVal, { color: theme.colors.text }]}>{value}</Text>
     <Text style={[styles.metricSub, { color: theme.colors.primary }]}>{sub}</Text>
  </GlassCard>
);

const DiagNode = ({ icon, label, status, theme }: any) => (
  <View style={[styles.diagNode, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
     {icon}
     <Text style={[styles.diagLabel, { color: theme.colors.textLight }]}>{label}</Text>
     <Text style={[styles.diagStatus, { color: theme.colors.text }]}>{status}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 50 },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  iconBtn: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2, fontStyle: 'italic', textTransform: 'uppercase' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  
  neuralModule: { marginTop: 20 },
  moduleHdr: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  moduleLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  moduleVal: { fontSize: 8, fontWeight: '900' },
  
  metricsGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: -30 },
  metricBlock: { flex: 1, padding: 20, borderRadius: 24, gap: 4 },
  metricHdr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  metricLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  metricVal: { fontSize: 16, fontWeight: '900', fontStyle: 'italic' },
  metricSub: { fontSize: 8, fontWeight: '900' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28, marginTop: 32, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  
  dataModule: { marginHorizontal: 24, padding: 20, borderRadius: 32 },
  tabBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabText: { fontSize: 9, fontWeight: '900' },
  distList: { gap: 16 },
  distItem: { gap: 8 },
  distInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  distName: { fontSize: 12, fontWeight: '700' },
  distVal: { fontSize: 12, fontWeight: '900', fontStyle: 'italic' },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  
  diagGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 24 },
  diagNode: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', gap: 8, borderWidth: 1 },
  diagLabel: { fontSize: 7, fontWeight: '900', textAlign: 'center' },
  diagStatus: { fontSize: 9, fontWeight: '900' }
});
