import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { sqliteService } from "../services/sqlite.service";
import { syncService } from "../services/sync.service";
import {
  RefreshCcw,
  Wifi,
  WifiOff,
  CloudSync,
  Layers,
  Database,
  Activity,
  Cpu,
} from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import { LinearGradient } from "expo-linear-gradient";

export const OfflineSync = () => {
  const { colors, typography, isDarkMode } = useAppTheme();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadPending = async () => {
    const data = await sqliteService.getUnsyncedOrders();
    setPendingOrders(data);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncOrders();
      await loadPending();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.badgeWrapper}>
              <PulseIndicator color={colors.primary} size={6} />
              <Text style={[styles.badgeText, typography.pro]}>
                REGISTRY_NODE_v1.4
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadPending}>
              <RefreshCcw size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.headerTitle,
              typography.pro,
              { color: colors.white },
            ]}
          >
            SYNC <Text style={{ color: colors.primary }}>NODE.</Text>
          </Text>
          <Text style={[styles.headerDesc, { color: colors.textLight }]}>
            SYNCHRONISATION DES REGISTRES LOCAUX AVEC LE NOYAU CENTRAL.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <GlassCard
            variant="transparent"
            intensity={15}
            style={styles.payloadCard}
          >
            <View style={styles.payloadHeader}>
              <Text style={[styles.payloadLabel, typography.pro]}>
                UNSYNCED_PAYLOAD
              </Text>
              <Database size={16} color={colors.primary} />
            </View>
            <View style={styles.payloadValueRow}>
              <Text
                style={[
                  styles.payloadValue,
                  typography.pro,
                  { color: colors.white },
                ]}
              >
                {pendingOrders.length}{" "}
                <Text style={styles.payloadUnit}>NODES</Text>
              </Text>
              {pendingOrders.length > 0 ? (
                <View style={styles.statusIndicator}>
                  <WifiOff size={24} color={colors.danger} />
                  <Text
                    style={[
                      styles.statusTag,
                      typography.pro,
                      { color: colors.danger },
                    ]}
                  >
                    OFFLINE
                  </Text>
                </View>
              ) : (
                <View style={styles.statusIndicator}>
                  <Wifi size={24} color={colors.accent} />
                  <Text
                    style={[
                      styles.statusTag,
                      typography.pro,
                      { color: colors.accent },
                    ]}
                  >
                    SYNCED
                  </Text>
                </View>
              )}
            </View>
          </GlassCard>
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Activity size={14} color={colors.primary} />
            <Text style={[styles.sectionLabel, typography.pro]}>
              PENDING_OPERATIONS
            </Text>
          </View>

          <FlatList
            data={pendingOrders}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <GlassCard
                  variant="transparent"
                  intensity={5}
                  style={styles.emptyGlass}
                >
                  <Layers
                    size={48}
                    color={colors.textLight}
                    style={{ opacity: 0.3 }}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      typography.pro,
                      { color: colors.textLight },
                    ]}
                  >
                    REGISTRY_FULLY_SYNCED
                  </Text>
                </GlassCard>
              </View>
            }
            renderItem={({ item }) => (
              <GlassCard
                variant="transparent"
                intensity={10}
                style={styles.orderCard}
              >
                <View style={styles.orderIndicator} />
                <View style={styles.orderMain}>
                  <Text style={[styles.orderRef, typography.pro]}>
                    REF_#{item.id}
                  </Text>
                  <Text
                    style={[
                      styles.orderType,
                      typography.pro,
                      { color: colors.white },
                    ]}
                  >
                    OFFLINE_TRANSACTION
                  </Text>
                </View>
                <View style={styles.orderSide}>
                  <Text
                    style={[
                      styles.orderAmount,
                      typography.pro,
                      { color: colors.primary },
                    ]}
                  >
                    {item.total} MAD
                  </Text>
                  <Text style={[styles.orderTime, typography.pro]}>
                    PENDING
                  </Text>
                </View>
              </GlassCard>
            )}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSync}
            disabled={isSyncing || pendingOrders.length === 0}
            activeOpacity={0.8}
            style={styles.syncBtnWrapper}
          >
            <LinearGradient
              colors={
                pendingOrders.length === 0
                  ? [colors.surface, colors.surface]
                  : [colors.primary, "#4338ca"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.syncBtn}
            >
              {isSyncing ? (
                <ActivityIndicator color="white" />
              ) : (
                <CloudSync
                  size={20}
                  color={
                    pendingOrders.length === 0 ? colors.textLight : "white"
                  }
                />
              )}
              <Text
                style={[
                  styles.syncBtnText,
                  typography.pro,
                  {
                    color:
                      pendingOrders.length === 0 ? colors.textLight : "white",
                  },
                ]}
              >
                {isSyncing ? "BROADCASTING_SIGNAL..." : "SYNCHRONIZE_ALL_NODES"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 25,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  badgeText: {
    color: "#818CF8",
    fontSize: 10,
  },
  refreshBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 32,
    marginBottom: 10,
  },
  headerDesc: {
    fontSize: 10,
    letterSpacing: 1,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  statsContainer: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  payloadCard: {
    padding: 20,
    borderRadius: 25,
  },
  payloadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  payloadLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  payloadValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  payloadValue: {
    fontSize: 42,
    lineHeight: 42,
  },
  payloadUnit: {
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
  },
  statusIndicator: {
    alignItems: "center",
    gap: 4,
  },
  statusTag: {
    fontSize: 8,
    letterSpacing: 1,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyState: {
    marginTop: 40,
  },
  emptyGlass: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderRadius: 30,
    gap: 20,
  },
  emptyText: {
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
  },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 12,
    borderRadius: 20,
  },
  orderIndicator: {
    width: 3,
    height: 30,
    backgroundColor: "rgba(99, 102, 241, 0.5)",
    borderRadius: 2,
    marginRight: 15,
  },
  orderMain: {
    flex: 1,
  },
  orderRef: {
    fontSize: 9,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 2,
  },
  orderType: {
    fontSize: 13,
  },
  orderSide: {
    alignItems: "flex-end",
  },
  orderAmount: {
    fontSize: 16,
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 8,
    color: "rgba(255,255,255,0.3)",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
  },
  syncBtnWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  syncBtnText: {
    fontSize: 12,
    letterSpacing: 2,
  },
});
