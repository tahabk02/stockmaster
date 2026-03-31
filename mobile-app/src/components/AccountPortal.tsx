import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { GlassCard } from "./GlassCard";
import { useAppTheme, normalize } from "../theme";
import { 
  User, 
  CreditCard, 
  Package, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  Activity
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export const AccountPortal = ({ user, stats }: any) => {
  const theme = useAppTheme();
  const { colors, typography, spacing } = theme;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* 1. IDENTITY HEADER */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <GlassCard variant="primary" style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={[styles.avatarBox, { backgroundColor: colors.surface + '20', borderColor: colors.white + '30' }]}>
              <User color="#fff" size={32} />
            </View>
            <View style={styles.identityText}>
              <Text style={[styles.name, { color: '#fff', ...typography.pro, fontSize: 18 }]}>{user?.name?.toUpperCase() || "CLIENT_UNIT"}</Text>
              <View style={styles.tierRow}>
                <Zap size={10} color={colors.accent} />
                <Text style={[styles.tier, { color: colors.accent, ...typography.pro, fontSize: 8 }]}>PREMIUM_TIER_ACTIVE</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={[styles.editLabel, { color: colors.white + '60', ...typography.pro, fontSize: 8 }]}>EDIT_NODE</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>

      {/* 2. RESOURCE QUOTAS (SaaS Limits) */}
      <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro }]}>RESOURCE_ALLOCATION</Text>
      <View style={styles.quotaGrid}>
        <QuotaCard 
          label="ASSET_CAPACITY" 
          current={stats?.totalItems || 0} 
          max={500} 
          color={colors.primary} 
          theme={theme} 
        />
        <QuotaCard 
          label="NETWORK_NODES" 
          current={stats?.nodeCount || 1} 
          max={5} 
          color={colors.accent} 
          theme={theme} 
        />
      </View>

      {/* 3. TRANSACTION HISTORY */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro }]}>RECENT_LEDGER</Text>
        <TouchableOpacity>
           <Text style={[styles.viewAll, { color: colors.primary, ...typography.pro, fontSize: 8 }]}>VIEW_ALL_HISTORY</Text>
        </TouchableOpacity>
      </View>

      <GlassCard variant="transparent" style={styles.historyCard}>
        <HistoryItem 
          title="INVENTORY_REPLENISHMENT" 
          date="24 MAR 2026" 
          amount="+1,250.00" 
          status="CONFIRMED" 
          theme={theme} 
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <HistoryItem 
          title="SERVICE_SUBSCRIPTION" 
          date="20 MAR 2026" 
          amount="-299.00" 
          status="PROCESSED" 
          theme={theme} 
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <HistoryItem 
          title="ASSET_LIQUIDATION" 
          date="15 MAR 2026" 
          amount="+4,800.00" 
          status="CONFIRMED" 
          theme={theme} 
        />
      </GlassCard>

      {/* 4. SYSTEM STATUS */}
      <Text style={[styles.sectionTitle, { color: colors.textLight, ...typography.pro }]}>NODE_HEALTH</Text>
      <GlassCard variant="dark" style={styles.statusCard}>
         <View style={styles.statusRow}>
            <Activity size={14} color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.accent, ...typography.pro, fontSize: 9 }]}>ENCRYPTED_SYNC_ACTIVE</Text>
            <View style={styles.spacer} />
            <Text style={[styles.latency, { color: colors.textLight, ...typography.pro, fontSize: 8 }]}>LATENCY: 12MS</Text>
         </View>
      </GlassCard>
    </ScrollView>
  );
};

const QuotaCard = ({ label, current, max, color, theme }: any) => {
  const progress = Math.min(current / max, 1);
  return (
    <GlassCard variant="transparent" style={styles.quotaCard}>
      <Text style={[styles.quotaLabel, { color: theme.colors.textLight, ...theme.typography.pro, fontSize: 7 }]}>{label}</Text>
      <View style={styles.quotaValRow}>
        <Text style={[styles.quotaVal, { color: theme.colors.text, ...theme.typography.pro, fontSize: 14 }]}>{current}</Text>
        <Text style={[styles.quotaMax, { color: theme.colors.textLight, ...theme.typography.pro, fontSize: 8 }]}>/ {max}</Text>
      </View>
      <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: color, width: `${progress * 100}%` }]} />
      </View>
    </GlassCard>
  );
};

const HistoryItem = ({ title, date, amount, status, theme }: any) => (
  <View style={styles.historyItem}>
    <View style={[styles.iconBox, { backgroundColor: theme.colors.surface + '05' }]}>
      <CreditCard size={16} color={theme.colors.textLight} />
    </View>
    <View style={styles.historyText}>
      <Text style={[styles.historyTitle, { color: theme.colors.text, ...theme.typography.pro, fontSize: 9 }]}>{title}</Text>
      <Text style={[styles.historyDate, { color: theme.colors.textLight, ...theme.typography.pro, fontSize: 7, opacity: 0.5 }]}>{date}</Text>
    </View>
    <View style={styles.historyRight}>
      <Text style={[styles.historyAmount, { color: amount.startsWith('+') ? theme.colors.accent : theme.colors.danger, ...theme.typography.pro, fontSize: 10 }]}>{amount}</Text>
      <Text style={[styles.historyStatus, { color: theme.colors.textLight, ...theme.typography.pro, fontSize: 6, opacity: 0.4 }]}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  identityCard: { padding: 20, borderRadius: 24, marginBottom: 24 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarBox: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  identityText: { flex: 1 },
  name: { letterSpacing: 1 },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  tier: { letterSpacing: 1 },
  editBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  editLabel: { letterSpacing: 1 },

  sectionTitle: { fontSize: 10, letterSpacing: 2, marginBottom: 16, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  viewAll: { letterSpacing: 1 },

  quotaGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quotaCard: { flex: 1, padding: 16, borderRadius: 20 },
  quotaLabel: { marginBottom: 4 },
  quotaValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  quotaVal: { fontStyle: 'italic' },
  quotaMax: { opacity: 0.4 },
  progressBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%' },

  historyCard: { borderRadius: 24, padding: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyText: { flex: 1 },
  historyTitle: { letterSpacing: 0.5 },
  historyDate: { marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontStyle: 'italic' },
  historyStatus: { marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16, opacity: 0.5 },

  statusCard: { padding: 16, borderRadius: 20, marginBottom: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { letterSpacing: 1 },
  spacer: { flex: 1 },
  latency: { opacity: 0.5 },
});
