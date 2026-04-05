import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import {
  Activity,
  Shield,
  Clock,
  ChevronRight,
  Filter,
  Search,
  Database,
  Terminal,
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { sqliteService } from "../services/sqlite.service";
import { LinearGradient } from "expo-linear-gradient";

export default function AuditLogsPage() {
  const { colors, typography } = useAppTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefresh] = useState(false);

  const fetchLogs = async () => {
    setRefresh(true);
    const data = await sqliteService.getAuditLogs(50);
    setLogs(data);
    setRefresh(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#06060F' }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "FORENSIC_PROTOCOL",
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '900', letterSpacing: 2, fontSize: 12, fontStyle: 'italic' }
        }}
      />

      <LinearGradient
        colors={['rgba(99, 102, 241, 0.05)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchLogs} tintColor={colors.primary} />
        }
      >
        <View style={styles.headerSpacer} />

        {/* HUD SUMMARY */}
        <Animated.View entering={FadeInDown.delay(100).duration(800)}>
          <GlassCard variant="dark" intensity={30} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
               <View>
                  <Text style={styles.summaryLabel}>TOTAL_SIGNALS</Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>{logs.length}</Text>
               </View>
               <View style={styles.vLine} />
               <View>
                  <Text style={styles.summaryLabel}>STATUS</Text>
                  <Text style={[styles.summaryValue, { color: '#10B981' }]}>ENCRYPTED</Text>
               </View>
               <View style={styles.vLine} />
               <View>
                  <Terminal size={24} color={colors.primary} />
               </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* SEARCH & FILTER */}
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.searchBar}>
              <Search size={16} color="rgba(255,255,255,0.3)" />
              <Text style={styles.searchText}>SEARCH_REGISTRY...</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.filterBtn}>
              <Filter size={16} color={colors.primary} />
           </TouchableOpacity>
        </View>

        {/* LOG FEED */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedLabel}>// LIVE_DATA_STREAM</Text>
          
          {logs.map((log, index) => (
            <Animated.View 
              key={log.id || index} 
              entering={FadeInDown.delay(index * 50).springify()}
              layout={Layout.springify()}
            >
              <GlassCard variant="dark" intensity={15} style={styles.logCard}>
                <View style={[styles.severityBar, { backgroundColor: log.severity === 'ERROR' ? '#f43f5e' : colors.primary }]} />
                
                <View style={styles.logMain}>
                  <View style={styles.logHeader}>
                    <Text style={[styles.logEvent, { color: '#fff' }]}>{log.event.toUpperCase()}</Text>
                    <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                  </View>
                  
                  <Text style={styles.logDetails} numberOfLines={1}>{log.details}</Text>
                  
                  <View style={styles.logFooter}>
                    <Database size={10} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.logNode}>NODE_{log.id || 'X'}</Text>
                    <View style={styles.spacer} />
                    <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))}

          {logs.length === 0 && (
            <View style={styles.emptyContainer}>
               <Activity size={40} color="rgba(255,255,255,0.1)" />
               <Text style={styles.emptyText}>NO_LOGS_DETECTED</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  headerSpacer: { height: 100 },
  summaryCard: { padding: 24, borderRadius: 24, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  vLine: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  searchBar: { flex: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '700' },
  filterBtn: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

  feedContainer: { gap: 12 },
  feedLabel: { color: '#6366f1', fontSize: 8, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  logCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', height: 100 },
  severityBar: { width: 4, height: '100%' },
  logMain: { flex: 1, padding: 16, justifyContent: 'space-between' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logEvent: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  logTime: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '700' },
  logDetails: { fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 14 },
  logFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logNode: { fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: '900' },
  spacer: { flex: 1 },

  emptyContainer: { padding: 60, alignItems: 'center', gap: 20 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
});
