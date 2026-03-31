import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import api from "../api/client";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

export default function SuppliersPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const isRTL = i18n.language === "ar";

  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await api.get("suppliers");
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (e) {
      console.error("[Suppliers] Connection compromised:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuppliers();
  };

  const handleContact = async (type: "phone" | "email", value: string) => {
    if (!value) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = type === "phone" ? `tel:${value}` : `mailto:${value}`;
    Linking.openURL(url);
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/supplier-details",
            params: { id: item._id },
          })
        }
      >
        <GlassCard
          style={[styles.card, { borderLeftColor: colors.primary }]}
          variant={isDarkMode ? "dark" : "light"}
        >
          <View
            style={[
              styles.cardHeader,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <View
              style={[
                styles.nameContainer,
                isRTL && { alignItems: "flex-end" },
              ]}
            >
              <View
                style={[
                  styles.titleRow,
                  isRTL && { flexDirection: "row-reverse" },
                ]}
              >
                <Text style={[styles.supplierName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <PulseIndicator color={colors.accent} size={6} />
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.primary + "10" },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category || "GENERAL_VENDOR"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.reliabilityBox,
                isRTL && { alignItems: "flex-start" },
              ]}
            >
              <Text
                style={[styles.reliabilityLabel, { color: colors.textLight }]}
              >
                {t('SUPPLIERS.RELIABILITY')}
              </Text>
              <View
                style={[
                  styles.ratingRow,
                  { backgroundColor: colors.warning + "15" },
                ]}
              >
                <Text style={{ color: colors.warning, fontSize: 10 }}>⭐</Text>
                <Text style={[styles.ratingText, { color: colors.warning }]}>
                  {item.rating || "9.8"}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.contactGrid,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.contactNode,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleContact("phone", item.phone || item.contact)}
            >
              <View
                style={[
                  styles.nodeIcon,
                  { backgroundColor: colors.primary + "10" },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 14 }}>📞</Text>
              </View>
              <View style={isRTL && { alignItems: "flex-end" }}>
                <Text style={[styles.nodeLabel, { color: colors.textLight }]}>
                  {t('SUPPLIERS.VOICE')}
                </Text>
                <Text
                  style={[styles.nodeValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.phone || item.contact || "SECURE"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactNode,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleContact("email", item.email)}
            >
              <View
                style={[
                  styles.nodeIcon,
                  { backgroundColor: colors.accent + "10" },
                ]}
              >
                <Text style={{ color: colors.accent, fontSize: 14 }}>✉️</Text>
              </View>
              <View style={isRTL && { alignItems: "flex-end" }}>
                <Text style={[styles.nodeLabel, { color: colors.textLight }]}>
                  {t('SUPPLIERS.DATA')}
                </Text>
                <Text
                  style={[styles.nodeValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.email || "ENCRYPTED"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.cardActions,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.primaryAction,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={async () => {
                if (Platform.OS !== "web") {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push({
                  pathname: "/provision-supplier",
                  params: { id: item._id, name: item.name },
                });
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>🚛</Text>
              <Text style={styles.primaryActionText}>{t('SUPPLIERS.PROVISION')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryAction,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/supplier-details",
                  params: { id: item._id },
                })
              }
            >
              <Text style={{ color: colors.primary, fontSize: 16 }}>↗</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
          isRTL && { direction: "rtl" },
        ]}
      >
        {/* 1. CINEMATIC HEADER */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.headerTop,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={[
                styles.backBtn,
                { backgroundColor: colors.glass, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 24 }}>
                {isRTL ? "→" : "←"}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("SUPPLIERS.TITLE")}
            </Text>
            <TouchableOpacity
              style={[
                styles.addBtn,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
              onPress={async () => {
                if (Platform.OS !== "web") {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push("/add-supplier");
              }}
            >
              <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDarkMode
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(0,0,0,0.05)",
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.textLight, fontSize: 18 }}>🔍</Text>
            <TextInput
              placeholder={t('SUPPLIERS.FILTER')}
              placeholderTextColor={colors.textLight}
              value={search}
              onChangeText={setSearch}
              style={[
                styles.searchInput,
                { color: colors.text },
                isRTL && { textAlign: "right", marginRight: 12, marginLeft: 0 },
              ]}
            />
            {search.length > 0 && (
              <Text style={{ color: colors.primary, fontSize: 14 }}>⚡</Text>
            )}
          </View>

          <View
            style={[
              styles.headerMetrics,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <View
              style={[
                styles.metricItem,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Text style={{ color: colors.accent, fontSize: 12 }}>✓</Text>
              <Text style={[styles.metricText, { color: colors.textLight }]}>
                {t('SUPPLIERS.TITLE')}: {suppliers.length}
              </Text>
            </View>
            <View
              style={[styles.metricDivider, { backgroundColor: colors.border }]}
            />
            <View
              style={[
                styles.metricItem,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Text style={{ color: colors.primary, fontSize: 12 }}>🌐</Text>
              <Text style={[styles.metricText, { color: colors.textLight }]}>
                SYNC: {t('COMMON.ACTIVE')}
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <PulseIndicator color={colors.primary} size={40} />
            <Text style={[styles.loadingText, { color: colors.primary }]}>
              {t("COMMON.LOADING")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyCenter}>
                <Text style={{ color: colors.border, fontSize: 64 }}>🚛</Text>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  {t('SUPPLIERS.NO_NODES')}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    fontStyle: "italic",
    textTransform: "uppercase",
  },
  addBtn: {
    padding: 10,
    borderRadius: 14,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 54,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },
  headerMetrics: {
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
    alignItems: "center",
  },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metricText: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  metricDivider: { width: 1, height: 10 },
  list: { padding: 24, paddingBottom: 120 },
  card: { marginBottom: 20, padding: 20, borderLeftWidth: 4 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  nameContainer: { gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  supplierName: {
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  categoryText: { fontSize: 8, fontWeight: "900", textTransform: "uppercase" },
  reliabilityBox: { alignItems: "flex-end" },
  reliabilityLabel: { fontSize: 7, fontWeight: "900", marginBottom: 4 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: "900", fontStyle: "italic" },
  contactGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  contactNode: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  nodeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  nodeLabel: { fontSize: 7, fontWeight: "900" },
  nodeValue: { fontSize: 10, fontWeight: "800" },
  cardActions: { flexDirection: "row", gap: 12 },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  secondaryAction: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 24,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
