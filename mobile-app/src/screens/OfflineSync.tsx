import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { sqliteService } from "../services/sqlite.service";
import { syncService } from "../services/sync.service";
import { RefreshCcw, Wifi, WifiOff, CloudSync, Layers } from "lucide-react-native";

export const OfflineSync = () => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
           <View style={styles.iconWrapper}>
              <RefreshCcw size={24} color="white" />
           </View>
           <Text style={styles.headerTitle}>Sync <Text style={styles.headerTitleAccent}>Node.</Text></Text>
        </View>
        <View style={styles.statusRow}>
           <View style={styles.statusDot} />
           <Text style={styles.statusText}>Operational Signals Live</Text>
        </View>
      </View>

      <View style={styles.payloadCard}>
         <View style={styles.payloadRow}>
            <View>
               <Text style={styles.payloadLabel}>Unsynced Payload</Text>
               <Text style={styles.payloadValue}>{pendingOrders.length} <Text style={styles.payloadUnit}>Nodes</Text></Text>
            </View>
            {pendingOrders.length > 0 ? <WifiOff size={32} color="#f43f5e" /> : <Wifi size={32} color="#10b981" />}
         </View>
      </View>

      <FlatList
        data={pendingOrders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
             <Layers size={64} color="#64748b" />
             <Text style={styles.emptyText}>Registry Synced</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View>
               <Text style={styles.orderRef}>Reference: #{item.id}</Text>
               <Text style={styles.orderType}>Offline Transaction</Text>
            </View>
            <Text style={styles.orderAmount}>{item.total} MAD</Text>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={handleSync}
        disabled={isSyncing || pendingOrders.length === 0}
        style={[
            styles.syncButton,
            isSyncing ? styles.syncButtonActive : (pendingOrders.length === 0 ? styles.syncButtonDisabled : styles.syncButtonEnabled)
        ]}
      >
        {isSyncing ? <ActivityIndicator color="white" /> : <CloudSync size={20} color={pendingOrders.length === 0 ? "#94a3b8" : "white"} />}
        <Text style={[
            styles.syncButtonText,
            pendingOrders.length === 0 ? styles.syncButtonTextDisabled : styles.syncButtonTextEnabled
        ]}>
          {isSyncing ? "Broadcasting..." : "Synchronize Nodes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 80,
    backgroundColor: "white",
  },
  header: {
    marginBottom: 40,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconWrapper: {
    padding: 12,
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#020617",
    textTransform: "uppercase",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  headerTitleAccent: {
    color: "#4f46e5",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  payloadCard: {
    backgroundColor: "#f8fafc",
    padding: 24,
    borderRadius: 30,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
  },
  payloadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payloadLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  payloadValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0f172a",
    fontStyle: "italic",
  },
  payloadUnit: {
    fontSize: 18,
    fontStyle: "normal",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    opacity: 0.2,
  },
  emptyText: {
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 5,
    marginTop: 24,
  },
  orderCard: {
    backgroundColor: "#f8fafc",
    padding: 24,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderRef: {
    fontSize: 8,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  orderType: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4f46e5",
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
  syncButton: {
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
    paddingVertical: 24,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  syncButtonEnabled: {
    backgroundColor: "#4f46e5",
  },
  syncButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
  syncButtonActive: {
    backgroundColor: "#0f172a",
    opacity: 0.8,
  },
  syncButtonText: {
    fontWeight: "900",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 3,
  },
  syncButtonTextEnabled: {
    color: "white",
  },
  syncButtonTextDisabled: {
    color: "#94a3b8",
  },
});
