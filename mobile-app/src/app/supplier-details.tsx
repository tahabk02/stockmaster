import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Truck, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Star,
  ExternalLink,
  Zap,
  TrendingUp,
  CreditCard,
  MapPin,
  Clock,
  Target
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import api from "../api/client";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import { NeuralChart } from "../components/NeuralChart";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";

const { width } = Dimensions.get('window');

export default function SupplierDetailsPage() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (id) fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    try {
      const { data } = await api.get(`suppliers/${id}`);
      if (data.success) {
        setSupplier(data.data);
      }
    } catch (e) {
      console.error("[SupplierDetails] Registry Connection Compromised:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (type: 'phone' | 'email' | 'web', value: string) => {
    if (!value) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = type === 'phone' ? `tel:${value}` : type === 'email' ? `mailto:${value}` : value;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <PulseIndicator color={colors.primary} size={40} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>{t("COMMON.LOADING")}</Text>
      </View>
    );
  }

  if (!supplier) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.loadingText, { color: colors.textLight }]}>{t('SUPPLIERS.NOT_FOUND')}</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: colors.primary }}>{t("COMMON.BACK")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* 1. CINEMATIC HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('SUPPLIERS.DOSSIER')}</Text>
          <View style={[styles.statusNode, { backgroundColor: colors.accent + '15' }, isRTL && { flexDirection: 'row-reverse' }]}>
            <PulseIndicator color={colors.accent} size={6} />
            <Text style={[styles.statusNodeText, { color: colors.accent }]}>{t('COMMON.ACTIVE')}</Text>
          </View>
        </View>

        <View style={[styles.mainInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.supplierName, { color: colors.text }]}>{supplier.name}</Text>
          <View style={[styles.categoryRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>{supplier.category || "GENERAL_VENDOR"}</Text>
            </View>
            <View style={[styles.ratingBadge, { backgroundColor: colors.warning + '15' }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Star size={10} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.warning }]}>{supplier.rating || "5.0"}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. PERFORMANCE ANALYTICS */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={[styles.sectionHdr, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{t('SUPPLIERS.PERFORMANCE')}</Text>
            <TrendingUp size={14} color={colors.primary} />
          </View>
          <View style={[styles.metricsGrid, isRTL && { flexDirection: 'row-reverse' }]}>
            <GlassCard style={styles.metricCard}>
              <Target size={18} color={colors.primary} />
              <Text style={[styles.mLabel, { color: colors.textLight }]}>{t('SUPPLIERS.RELIABILITY')}</Text>
              <Text style={[styles.mValue, { color: colors.text }]}>{supplier.performance?.reliability || 100}%</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <Clock size={18} color={colors.accent} />
              <Text style={[styles.mLabel, { color: colors.textLight }]}>{t('SUPPLIERS.LEAD_TIME')}</Text>
              <Text style={[styles.mValue, { color: colors.text }]}>{supplier.performance?.leadTimeAvg || 0}d</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <ShieldCheck size={18} color={colors.warning} />
              <Text style={[styles.mLabel, { color: colors.textLight }]}>{t('SUPPLIERS.COMPLIANCE')}</Text>
              <Text style={[styles.mValue, { color: colors.text }]}>{supplier.audit?.complianceScore || 100}%</Text>
            </GlassCard>
          </View>
        </Animated.View>

        {/* 3. CONTACT PROTOCOL */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>{t('SUPPLIERS.CHANNELS')}</Text>
          <GlassCard style={styles.contactContainer}>
            <TouchableOpacity 
              style={[styles.contactItem, { borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => handleContact('phone', supplier.phone)}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                <Phone size={18} color={colors.primary} />
              </View>
              <View style={[styles.contactContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.cLabel, { color: colors.textLight }]}>{t('SUPPLIERS.VOICE')}</Text>
                <Text style={[styles.cValue, { color: colors.text }]}>{supplier.phone || "SECURE_ONLY"}</Text>
              </View>
              <ExternalLink size={14} color={colors.textLight} style={isRTL && { marginRight: 'auto', marginLeft: 0 }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactItem, { borderColor: colors.border, marginTop: 12 }, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => handleContact('email', supplier.email)}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.accent + '10' }]}>
                <Mail size={18} color={colors.accent} />
              </View>
              <View style={[styles.contactContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.cLabel, { color: colors.textLight }]}>{t('SUPPLIERS.DATA')}</Text>
                <Text style={[styles.cValue, { color: colors.text }]}>{supplier.email || "ENCRYPTED"}</Text>
              </View>
              <ExternalLink size={14} color={colors.textLight} style={isRTL && { marginRight: 'auto', marginLeft: 0 }} />
            </TouchableOpacity>

            <View style={[styles.contactItem, { borderColor: colors.border, marginTop: 12, borderBottomWidth: 0 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.warning + '10' }]}>
                <MapPin size={18} color={colors.warning} />
              </View>
              <View style={[styles.contactContent, isRTL && { alignItems: 'flex-end', marginRight: 16, marginLeft: 0 }]}>
                <Text style={[styles.cLabel, { color: colors.textLight }]}>{t('CLIENTS.COORD')}</Text>
                <Text style={[styles.cValue, { color: colors.text }]} numberOfLines={1}>{supplier.address || "OFF_GRID"}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* 4. FINANCIAL REGISTRY */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>{t('SUPPLIERS.EXPOSURE')}</Text>
          <View style={[styles.finGrid, isRTL && { flexDirection: 'row-reverse' }]}>
            <GlassCard style={styles.finCard}>
              <CreditCard size={20} color={colors.danger} />
              <View style={[{ marginTop: 12 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.fLabel, { color: colors.textLight }]}>{t('CLIENTS.DEBT')}</Text>
                <Text style={[styles.fValue, { color: colors.danger }]}>{formatCurrency(supplier.totalDebt || 0)}</Text>
              </View>
            </GlassCard>
            <GlassCard style={styles.finCard}>
              <ShieldCheck size={20} color={colors.accent} />
              <View style={[{ marginTop: 12 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.fLabel, { color: colors.textLight }]}>{t('CLIENTS.LIMIT')}</Text>
                <Text style={[styles.fValue, { color: colors.accent }]}>{formatCurrency(supplier.creditLimit || 0)}</Text>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        {/* 5. TRANSACTION VOLUME */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 24, marginBottom: 120 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>{t('SUPPLIERS.PULSE')}</Text>
          <GlassCard style={{ padding: 20 }}>
            <NeuralChart />
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* FLOATING ACTION */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={async () => {
            if (Platform.OS !== 'web') {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            router.push({ pathname: "/provision-supplier", params: { id: supplier._id, name: supplier.name } });
          }}
        >
          <Truck size={24} color="#fff" />
          <Text style={styles.fabText}>{t('SUPPLIERS.INITIATE')}</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  statusNode: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusNodeText: { fontSize: 8, fontWeight: "900" },
  mainInfo: { gap: 12 },
  supplierName: { fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  categoryRow: { flexDirection: 'row', gap: 12 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryText: { fontSize: 9, fontWeight: "900" },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: "900" },
  scrollContent: { padding: 24 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  metricCard: { flex: 1, padding: 16, alignItems: 'center', gap: 8 },
  mLabel: { fontSize: 7, fontWeight: "900" },
  mValue: { fontSize: 16, fontWeight: "900", fontStyle: "italic" },
  contactContainer: { padding: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactContent: { flex: 1, marginLeft: 16 },
  cLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 0.5, marginBottom: 2 },
  cValue: { fontSize: 13, fontWeight: "800" },
  finGrid: { flexDirection: 'row', gap: 16 },
  finCard: { flex: 1, padding: 20 },
  fLabel: { fontSize: 8, fontWeight: "900", marginBottom: 4 },
  fValue: { fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  fabContainer: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  fab: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  fabText: { color: '#fff', fontSize: 12, fontWeight: "900", letterSpacing: 2, fontStyle: "italic" }
});
