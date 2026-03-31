import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Package, 
  User, 
  Calendar, 
  CreditCard, 
  Receipt, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Hash
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import api from "../api/client";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import { formatDate, formatCurrency } from "../utils/format";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get('window');

export default function OrderDetailsPage() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`orders/${id}`);
      if (data.success) {
        setOrder(data.data);
      }
    } catch (e) {
      console.error("[OrderDetails] Connection compromised:", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PROCESSING": return { color: colors.primary, icon: <Clock size={16} color={colors.primary} />, label: t('ORDERS.STATUS.PROCESSING') };
      case "SHIPPED": return { color: colors.warning, icon: <Truck size={16} color={colors.warning} />, label: t('ORDERS.STATUS.SHIPPED') };
      case "DELIVERED": return { color: colors.accent, icon: <CheckCircle size={16} color={colors.accent} />, label: t('ORDERS.STATUS.DELIVERED') };
      case "CANCELLED": return { color: colors.danger, icon: <XCircle size={16} color={colors.danger} />, label: t('ORDERS.STATUS.CANCELLED') };
      default: return { color: colors.textLight, icon: <Zap size={16} color={colors.textLight} />, label: status };
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <PulseIndicator color={colors.primary} size={40} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>{t("COMMON.LOADING")}</Text>
      </View>
    );
  }

  if (!order) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.loadingText, { color: colors.textLight }]}>{t('ORDERS.NOT_FOUND')}</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: colors.primary }}>{t("COMMON.BACK")}</Text>
      </TouchableOpacity>
    </View>
  );

  const statusConfig = getStatusConfig(order.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('ORDERS.DOSSIER')}</Text>
          <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
            <ShieldCheck color={colors.primary} size={18} />
          </View>
        </View>

        <View style={[styles.orderIdRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={isRTL && { alignItems: 'flex-end' }}>
            <Text style={[styles.label, { color: colors.textLight }]}>{t('ORDERS.ID')}</Text>
            <Text style={[styles.idValue, { color: colors.text }]}>{order.receiptNumber || `ID_${order._id.substring(0, 8)}`}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15', borderColor: statusConfig.color + '30' }, isRTL && { flexDirection: 'row-reverse' }]}>
            {statusConfig.icon}
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CUSTOMER SECTION */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('ORDERS.ORIGIN')}</Text>
          <GlassCard style={styles.infoCard} variant={isDarkMode ? "dark" : "light"}>
            <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={[styles.infoContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('CLIENTS.DETAILS')}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{order.clientId?.name || "WALK_IN_PROTOCOL"}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent + '10' }]}>
                <Calendar size={20} color={colors.accent} />
              </View>
              <View style={[styles.infoContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textLight }]}>LOG_TIMESTAMP</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ITEMS SECTION */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('ORDERS.MANIFEST')}</Text>
          <GlassCard style={styles.itemsCard} variant={isDarkMode ? "dark" : "light"}>
            {order.items.map((item: any, index: number) => (
              <View key={index}>
                <View style={[styles.itemRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.surface }]}>
                    <Package size={18} color={colors.primary} />
                  </View>
                  <View style={[styles.itemMain, isRTL && { alignItems: 'flex-end', marginRight: 12, marginLeft: 0 }]}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.productId?.name || "REDACTED_ASSET"}</Text>
                    <Text style={[styles.itemSub, { color: colors.textLight }]}>{item.quantity} {t('COMMON.UNITS')} x {formatCurrency(item.price)}</Text>
                  </View>
                  <Text style={[styles.itemTotal, { color: colors.text }]}>{formatCurrency(item.quantity * item.price)}</Text>
                </View>
                {index < order.items.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* FINANCIAL SUMMARY */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('ORDERS.FINANCIAL')}</Text>
          <GlassCard style={styles.summaryCard} variant={isDarkMode ? "dark" : "light"}>
            <View style={[styles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>{t('ORDERS.SUBTOTAL')}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(order.subTotal || (order.totalPrice - order.taxAmount + order.discount))}</Text>
            </View>
            <View style={[styles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>{t('ORDERS.TAX')}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{`+ ${formatCurrency(order.taxAmount || 0)}`}</Text>
            </View>
            <View style={[styles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>{t('ORDERS.DISCOUNT')}</Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>{`- ${formatCurrency(order.discount || 0)}`}</Text>
            </View>
            <View style={[styles.totalDivider, { backgroundColor: colors.primary }]} />
            <View style={[styles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>{t('ORDERS.TOTAL_VALUATION')}</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(order.totalPrice)}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* PAYMENT INFO */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 24, marginBottom: 100 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('ORDERS.SETTLEMENT')}</Text>
          <GlassCard style={styles.paymentCard} variant={isDarkMode ? "dark" : "light"}>
            <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.warning + '10' }]}>
                <CreditCard size={20} color={colors.warning} />
              </View>
              <View style={[styles.infoContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('ORDERS.PAYMENT')}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{order.paymentMethod}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent + '10' }]}>
                <Receipt size={20} color={colors.accent} />
              </View>
              <View style={[styles.infoContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('ORDERS.RECEIVED')}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{formatCurrency(order.amountReceived)}</Text>
              </View>
              <View style={[styles.changeBox, { backgroundColor: colors.primary + '10' }, isRTL && { marginLeft: 0, marginRight: 'auto' }]}>
                <Text style={[styles.changeLabel, { color: colors.primary }]}>{`${t('ORDERS.CHANGE')}: ${formatCurrency(order.change)}`}</Text>
              </View>
            </View>
          </GlassCard>
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
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  badge: { padding: 10, borderRadius: 14 },
  orderIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 8, fontWeight: "900", letterSpacing: 1, marginBottom: 4 },
  idValue: { fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  scrollContent: { padding: 24 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase" },
  infoCard: { padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  infoContent: { marginLeft: 16 },
  infoLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 1, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "800" },
  itemsCard: { padding: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemMain: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 13, fontWeight: "800" },
  itemSub: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: "900", fontStyle: "italic" },
  divider: { height: 1, marginVertical: 16, opacity: 0.3 },
  summaryCard: { padding: 20, gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: "700" },
  summaryValue: { fontSize: 13, fontWeight: "800" },
  totalDivider: { height: 2, marginVertical: 4, borderRadius: 1 },
  totalLabel: { fontSize: 14, fontWeight: "900" },
  totalValue: { fontSize: 22, fontWeight: "900", fontStyle: "italic" },
  paymentCard: { padding: 20 },
  changeBox: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  changeLabel: { fontSize: 9, fontWeight: "900" }
});
