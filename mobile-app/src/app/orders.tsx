import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl, Platform } from "react-native";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, ShieldCheck, Zap, Calendar, User, ChevronRight, CreditCard, Filter, Activity } from "lucide-react-native";
import { useAppTheme } from "../theme";
import api from "../api/client";
import Animated, { FadeInDown } from "react-native-reanimated";
import { formatDate, formatCurrency } from "../utils/format";
import { useTranslation } from "react-i18next";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('orders');
      if (data.success) setOrders(data.data || []);
    } catch (e) {
      console.error("[Orders] Link Severed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PROCESSING": return { color: colors.primary, icon: <Clock size={12} color={colors.primary} />, label: t('ORDERS.STATUS.PROCESSING') };
      case "SHIPPED": return { color: colors.warning, icon: <Truck size={12} color={colors.warning} />, label: t('ORDERS.STATUS.SHIPPED') };
      case "DELIVERED": return { color: colors.accent, icon: <CheckCircle size={12} color={colors.accent} />, label: t('ORDERS.STATUS.DELIVERED') };
      default: return { color: colors.textLight, icon: <Zap size={12} color={colors.textLight} />, label: status };
    }
  };

  const renderItem = ({ item, index }: any) => {
    const config = getStatusConfig(item.status);
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper} onPress={() => router.push({ pathname: "/order-details", params: { id: item._id } })}>
          <GlassCard style={[styles.orderCard, { borderLeftColor: config.color }]} variant={isDarkMode ? "dark" : "light"}>
            <View style={styles.cardHeader}>
               <View style={styles.idGroup}>
                  <Text style={[styles.orderId, { color: colors.primary }]}>{item.receiptNumber || `PO_${item._id.substring(0, 6)}`}</Text>
                  <PulseIndicator color={config.color} size={4} />
               </View>
               <View style={[styles.statusTag, { backgroundColor: config.color + '15' }]}>
                  {config.icon}
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
               </View>
            </View>
            
            <View style={styles.cardBody}>
               <View style={styles.dataNode}>
                  <User size={12} color={colors.textLight} />
                  <Text style={[styles.nodeValue, { color: colors.text }]}>{item.clientId?.name || "WALK_IN_USER"}</Text>
               </View>
               <View style={styles.dataNode}>
                  <Calendar size={12} color={colors.textLight} />
                  <Text style={[styles.nodeValue, { color: colors.text }]}>{formatDate(item.createdAt)}</Text>
               </View>
            </View>

            <View style={styles.cardFooter}>
               <View>
                  <Text style={[styles.priceLabel, { color: colors.textLight }]}>{t('ORDERS.TOTAL_VALUATION')}</Text>
                  <Text style={[styles.priceVal, { color: colors.text }]}>{formatCurrency(item.totalPrice)}</Text>
               </View>
               <ChevronRight size={16} color={colors.textLight} opacity={0.5} />
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('ORDERS.PULSE'), headerTransparent: true, headerTintColor: colors.text }} />
      
      <View style={[styles.header, { backgroundColor: '#000' }]}>
         <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
               <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('ORDERS.TITLE')}</Text>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
               <Filter color="#fff" size={18} />
            </TouchableOpacity>
         </View>

         <View style={styles.pulseOverview}>
            <View style={styles.pulseItem}>
               <Text style={styles.pulseLabel}>{t('ORDERS.TOTAL_ENTRIES')}</Text>
               <Text style={styles.pulseVal}>{orders.length}</Text>
            </View>
            <View style={styles.pulseDivider} />
            <View style={styles.pulseItem}>
               <Text style={styles.pulseLabel}>{t('ORDERS.NETWORK_SYNC')}</Text>
               <View style={styles.syncRow}>
                  <PulseIndicator color="#10b981" size={6} />
                  <Text style={[styles.syncText, { color: '#10b981' }]}>ENCRYPTED</Text>
               </View>
            </View>
         </View>
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
             <Activity size={48} color={colors.border} />
             <Text style={[styles.emptyText, { color: colors.text }]}>{t('ORDERS.ZERO_TRANSACTIONS')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  iconBtn: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  filterBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  pulseOverview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pulseItem: { flex: 1, gap: 4 },
  pulseLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  pulseVal: { color: '#fff', fontSize: 18, fontWeight: '900', fontStyle: 'italic' },
  pulseDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncText: { fontSize: 10, fontWeight: '900' },
  
  list: { padding: 24, paddingBottom: 120 },
  cardWrapper: { marginBottom: 16 },
  orderCard: { padding: 20, borderRadius: 24, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  statusText: { fontSize: 8, fontWeight: "900", textTransform: "uppercase" },
  
  cardBody: { gap: 10, marginBottom: 16 },
  dataNode: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nodeValue: { fontSize: 12, fontWeight: "700" },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  priceLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 1, marginBottom: 2 },
  priceVal: { fontSize: 16, fontWeight: "900", fontStyle: "italic" },
  
  emptyCenter: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 24, fontSize: 12, fontWeight: "900", letterSpacing: 2 }
});
