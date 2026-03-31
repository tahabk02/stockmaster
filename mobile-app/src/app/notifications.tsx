import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Inbox,
  ShieldAlert,
  Zap,
  Trash2
} from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import api from "../api/client";
import { formatDate } from "../utils/format";
import { useTranslation } from "react-i18next";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('notifications');
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error("[Notifications] Signal Intercept Failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'STOCK_ALERT':
      case 'WARNING': 
        return <AlertTriangle size={20} color={colors.danger} />;
      case 'ORDER_CONFIRMED':
      case 'SUCCESS': 
        return <CheckCircle size={20} color={colors.accent} />;
      default: return <Info size={20} color={colors.primary} />;
    }
  };

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity 
        style={[styles.notifWrapper, item.read && styles.readItem]}
        activeOpacity={0.7}
      >
        <GlassCard style={[styles.notifCard, { borderLeftColor: item.type === 'WARNING' ? colors.danger : colors.primary }]} variant={isDarkMode ? "dark" : "light"}>
          <View style={[styles.notifHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
              {getIcon(item.type)}
            </View>
            <View style={[styles.titleContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.notifTime, { color: colors.textLight }]}>{formatDate(item.createdAt)}</Text>
            </View>
            {!item.read && <PulseIndicator color={colors.primary} size={6} />}
          </View>
          <Text style={[styles.notifBody, { color: colors.text }, isRTL && { textAlign: 'right' }]}>{item.message || item.body}</Text>
          
          <View style={[styles.cardFooter, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.typeBadge, { backgroundColor: colors.glass }]}>
              <Zap size={10} color={colors.textLight} />
              <Text style={[styles.typeText, { color: colors.textLight }]}>{item.type || "SYSTEM_SIGNAL"}</Text>
            </View>
            <TouchableOpacity style={styles.purgeBtn}>
              <Trash2 size={14} color={colors.textLight} opacity={0.3} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* 1. CINEMATIC HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("DASHBOARD.ALERTS")}</Text>
          <View style={[styles.headerBadge, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '20' }]}>
            <ShieldAlert color={colors.danger} size={18} />
          </View>
        </View>

        <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.statItem, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>{t('NOTIFICATIONS.INTERCEPTED')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{notifications.length}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.statItem, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>{t('COMMON.STATUS')}</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{t('COMMON.ACTIVE')}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <PulseIndicator color={colors.primary} size={40} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>{t("COMMON.LOADING")}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <Inbox size={64} color={colors.border} strokeWidth={1} />
              <Text style={[styles.emptyText, { color: colors.text }]}>{t('NOTIFICATIONS.EMPTY')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  headerBadge: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  statItem: { flex: 1 },
  statLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  divider: { width: 1, height: 20 },
  list: { padding: 24, paddingBottom: 120 },
  notifWrapper: { marginBottom: 16 },
  notifCard: { padding: 16, borderLeftWidth: 4 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  titleContent: { flex: 1, marginLeft: 16 },
  notifTitle: { fontSize: 14, fontWeight: "900", marginBottom: 2 },
  notifTime: { fontSize: 8, fontWeight: "700" },
  notifBody: { fontSize: 12, opacity: 0.7, lineHeight: 18, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  typeText: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  purgeBtn: { padding: 4 },
  readItem: { opacity: 0.5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 24, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  emptyCenter: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 24, fontSize: 14, fontWeight: "900", letterSpacing: 2 },
});
