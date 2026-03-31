import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar
} from "react-native";
import { useAppTheme } from "../theme";
import { 
  ArrowLeft, 
  CloudSync, 
  ShieldCheck, 
  Database, 
  Zap, 
  RefreshCw,
  Server,
  Activity,
  ChevronRight
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { syncService } from "../services/sync.service";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { GlassCard } from "../components/GlassCard";
import { useTranslation } from "react-i18next";

export default function SyncPage() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>(["SYNC.IDLE"]);

  const isRTL = i18n.language === 'ar';

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  const startSync = async () => {
    setSyncing(true);
    addLog(t("SYNC.INIT"));
    
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      const success = await syncService.performFullSync(addLog);
      if (success) {
        addLog(t("SYNC.SUCCESS"));
      } else {
        addLog(t("SYNC.FAIL"));
      }
    } catch (e) {
      addLog(t("SYNC.CRITICAL"));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* 1. CINEMATIC HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("DASHBOARD.SYNC")}</Text>
          <View style={[styles.headerBadge, { backgroundColor: colors.primary + '10' }]}>
            <CloudSync color={colors.primary} size={18} />
          </View>
        </View>

        <View style={styles.syncStatusContainer}>
          <View style={[styles.statusIconBox, { backgroundColor: syncing ? colors.primary + '20' : colors.accent + '20' }]}>
            {syncing ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <ShieldCheck color={colors.accent} size={40} />
            )}
          </View>
          <Text style={[styles.statusMain, { color: colors.text }]}>{syncing ? t("SYNC.PROGRESS") : t("SYNC.SECURED")}</Text>
          <Text style={[styles.statusSub, { color: colors.textLight }]}>{t("SYNC.LAST_PULSE")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.sectionLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t("SYNC.LOGS")}</Text>
        <GlassCard style={styles.logCard} variant="dark">
          {logs.map((log, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 100)}>
              <View style={[styles.logRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Zap size={10} color={i === 0 ? colors.primary : colors.textLight} />
                <Text style={[styles.logText, { color: i === 0 ? colors.white : colors.textLight }, isRTL && { textAlign: 'right', marginRight: 10, marginLeft: 0 }]}>{t(log) === log ? log : t(log)}</Text>
              </View>
              {i < logs.length - 1 && <View style={[styles.logDivider, { backgroundColor: colors.border }]} />}
            </Animated.View>
          ))}
        </GlassCard>

        <View style={[styles.nodeGrid, isRTL && { flexDirection: 'row-reverse' }]}>
          <NodeCard icon={<Server size={16} color={colors.primary} />} label={t("SYNC.DB_CLOUD")} status={t("COMMON.ACTIVE")} theme={theme} />
          <NodeCard icon={<Database size={16} color={colors.accent} />} label={t("SYNC.DB_LOCAL")} status={t("COMMON.OPTIMAL")} theme={theme} />
        </View>

        <TouchableOpacity 
          style={[styles.syncBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
          onPress={startSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.syncBtnText}>{t("SYNC.START")}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Activity size={12} color={colors.textLight} opacity={0.3} />
          <Text style={[styles.footerText, { color: colors.textLight }]}>{t("SYNC.LATENCY")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const NodeCard = ({ icon, label, status, theme }: any) => (
  <View style={[styles.nodeCard, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }]}>
    <View style={styles.nodeIcon}>{icon}</View>
    <View>
      <Text style={[styles.nodeLabel, { color: theme.colors.textLight }]}>{label}</Text>
      <Text style={[styles.nodeStatus, { color: theme.colors.text }]}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: '100%', marginBottom: 40 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  headerBadge: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  syncStatusContainer: { alignItems: 'center' },
  statusIconBox: { width: 100, height: 100, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  statusMain: { fontSize: 24, fontWeight: "900", fontStyle: "italic", letterSpacing: 1 },
  statusSub: { fontSize: 8, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  content: { padding: 24, paddingBottom: 100 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  logCard: { padding: 20, marginBottom: 32 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  logText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  logDivider: { height: 1, opacity: 0.1 },
  nodeGrid: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  nodeCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, borderWidth: 1 },
  nodeIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },
  nodeLabel: { fontSize: 7, fontWeight: "900" },
  nodeStatus: { fontSize: 10, fontWeight: "900" },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, borderRadius: 24, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  syncBtnText: { color: "#fff", fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  footer: { marginTop: 32, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: 0.5 },
  footerText: { fontSize: 8, fontWeight: "800", letterSpacing: 1 },
});
