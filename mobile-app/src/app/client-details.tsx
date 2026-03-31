import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
  Dimensions,
  Alert,
  FlatList
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Star,
  ExternalLink,
  Zap,
  CreditCard,
  Building2,
  TrendingUp,
  Clock,
  History,
  Edit3,
  Trash2,
  ShoppingBag
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import clientService, { Client } from "../services/client.service";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "../utils/format";

const { width } = Dimensions.get('window');

export default function ClientDetailsPage() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const isRTL = i18n.language === 'ar';

  const fetchClient = useCallback(async () => {
    if (!id) return;
    try {
      const data = await clientService.getClientById(id as string);
      setClient(data);
    } catch (e) {
      console.error("[ClientDetails] Registry Connection Compromised:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleContact = async (type: 'phone' | 'email') => {
    if (!client) return;
    const value = type === 'phone' ? client.phone : client.email;
    if (!value) return;
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = type === 'phone' ? `tel:${value}` : `mailto:${value}`;
    Linking.openURL(url);
  };

  const handleDelete = async () => {
    if (!client?._id) return;
    Alert.alert(
      t('COMMON.DELETE'),
      `${t('CLIENTS.DELETE_CONFIRM')} ${client.name}?`,
      [
        { text: t('COMMON.CANCEL'), style: 'cancel' },
        { 
          text: t('COMMON.DELETE'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await clientService.deleteClient(client._id!);
              if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (e) {
              Alert.alert("Error", "Could not purge client from registry.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <PulseIndicator color={colors.primary} size={40} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>{t("COMMON.LOADING")}</Text>
      </View>
    );
  }

  if (!client) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.loadingText, { color: colors.textLight }]}>{t('CLIENTS.NOT_FOUND')}</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: colors.primary }}>{t("COMMON.BACK")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('CLIENTS.DOSSIER')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/add-client", params: { id: client._id } })}
              style={[styles.actionBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
            >
              <Edit3 size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              style={[styles.actionBtn, { backgroundColor: colors.danger + '20', borderColor: colors.danger }]}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.mainInfo, isRTL && { alignItems: 'flex-end' }]}>
          <View style={[styles.titleLine, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.clientName, { color: colors.text }]}>{client.name}</Text>
            <View style={[styles.statusNode, { backgroundColor: colors.accent + '15' }, isRTL && { flexDirection: 'row-reverse' }]}>
                <PulseIndicator color={colors.accent} size={6} />
                <Text style={[styles.statusNodeText, { color: colors.accent }]}>{client.status || t('COMMON.ACTIVE')}</Text>
            </View>
          </View>
          <View style={[styles.typeRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.typeText, { color: colors.primary }]}>{client.type || "INDIVIDUAL"}</Text>
            </View>
            <View style={[styles.loyaltyBadge, { backgroundColor: colors.warning + '15' }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Zap size={10} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.loyaltyText, { color: colors.warning }]}>{client.loyaltyPoints || 0} PTS</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('CLIENTS.METRICS')}</Text>
          <View style={[styles.metricsGrid, isRTL && { flexDirection: 'row-reverse' }]}>
            <GlassCard style={styles.metricCard}>
              <CreditCard size={18} color={colors.danger} />
              <Text style={[styles.mLabel, { color: colors.textLight }]}>{t('CLIENTS.DEBT')}</Text>
              <Text style={[styles.mValue, { color: colors.danger }]}>{formatCurrency(client.totalDebt || 0)}</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <ShieldCheck size={18} color={colors.accent} />
              <Text style={[styles.mLabel, { color: colors.textLight }]}>{t('CLIENTS.LIMIT')}</Text>
              <Text style={[styles.mValue, { color: colors.accent }]}>{formatCurrency(client.creditLimit || 0)}</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <TrendingUp size={18} color={colors.primary} />
              <Text style={[styles.mLabel, { color: colors.textLight }]}>{t('CLIENTS.TOTAL_SPENT') || 'SPENT'}</Text>
              <Text style={[styles.mValue, { color: colors.primary }]}>{formatCurrency(client.stats?.totalSpent || 0)}</Text>
            </GlassCard>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>{t('CLIENTS.PROTOCOL')}</Text>
          <GlassCard style={styles.contactContainer}>
            <TouchableOpacity 
              style={[styles.contactItem, { borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => handleContact('phone')}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                <Phone size={18} color={colors.primary} />
              </View>
              <View style={[styles.contactContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.cLabel, { color: colors.textLight }]}>{t('SUPPLIERS.VOICE')}</Text>
                <Text style={[styles.cValue, { color: colors.text }]}>{client.phone || "N/A"}</Text>
              </View>
              <ExternalLink size={14} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactItem, { borderColor: colors.border, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.accent + '10' }]}>
                <Mail size={18} color={colors.accent} />
              </View>
              <View style={[styles.contactContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.cLabel, { color: colors.textLight }]}>{t('SUPPLIERS.DATA')}</Text>
                <Text style={[styles.cValue, { color: colors.text }]}>{client.email || "N/A"}</Text>
              </View>
              <ExternalLink size={14} color={colors.textLight} />
            </TouchableOpacity>

            <View style={[styles.contactItem, { borderBottomWidth: 0, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.warning + '10' }]}>
                <MapPin size={18} color={colors.warning} />
              </View>
              <View style={[styles.contactContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.cLabel, { color: colors.textLight }]}>{t('CLIENTS.COORD')}</Text>
                <Text style={[styles.cValue, { color: colors.text }]}>{client.address || "N/A"}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 24, marginBottom: 100 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>{t('CLIENTS.LOGS')}</Text>
          {client.stats?.recentOrders && client.stats.recentOrders.length > 0 ? (
            client.stats.recentOrders.map((order: any, idx: number) => (
              <Animated.View key={order._id} entering={FadeInRight.delay(idx * 100)}>
                <GlassCard style={styles.logCard}>
                  <View style={[styles.logHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.logIcon, { backgroundColor: colors.primary + '15' }]}>
                      <ShoppingBag size={14} color={colors.primary} />
                    </View>
                    <View style={[styles.logMeta, isRTL && { alignItems: 'flex-end', marginRight: 12, marginLeft: 0 }]}>
                      <Text style={[styles.logTitle, { color: colors.text }]}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                      <Text style={[styles.logDate, { color: colors.textLight }]}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <Text style={[styles.logAmount, { color: colors.accent }]}>{formatCurrency(order.totalPrice)}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          ) : (
            <GlassCard style={{ padding: 20, alignItems: 'center', gap: 12 }}>
                <History size={32} color={colors.border} />
                <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textLight }}>{t('CLIENTS.NO_TRANSACTIONS')}</Text>
            </GlassCard>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 24, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  actionBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  statusNode: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusNodeText: { fontSize: 8, fontWeight: "900" },
  mainInfo: { gap: 12 },
  titleLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { fontSize: 24, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", flex: 1 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 9, fontWeight: "900" },
  loyaltyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  loyaltyText: { fontSize: 10, fontWeight: "900" },
  scrollContent: { padding: 24 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase" },
  metricsGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metricCard: { width: (width - 60) / 2, padding: 16, alignItems: 'center', gap: 8, marginBottom: 12 },
  mLabel: { fontSize: 7, fontWeight: "900" },
  mValue: { fontSize: 16, fontWeight: "900", fontStyle: "italic" },
  contactContainer: { padding: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactContent: { flex: 1, marginLeft: 16 },
  cLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 0.5, marginBottom: 2 },
  cValue: { fontSize: 13, fontWeight: "800" },
  logCard: { padding: 16, marginBottom: 12 },
  logHeader: { flexDirection: 'row', alignItems: 'center' },
  logIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logMeta: { flex: 1, marginLeft: 12 },
  logTitle: { fontSize: 12, fontWeight: '900' },
  logDate: { fontSize: 8, fontWeight: '700' },
  logAmount: { fontSize: 14, fontWeight: '900', fontStyle: 'italic' }
});
