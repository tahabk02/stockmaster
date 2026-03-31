import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ProgressBarAndroid, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Package, Settings, AlertCircle, CheckCircle, Clock, Play, Pause, ChevronRight, Zap } from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";

const ProductionOrder = ({ id, product, quantity, progress, status, theme, t }: any) => {
  const router = useRouter();
  
  const handleControl = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Control logic
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
      <GlassCard style={[styles.card, { borderLeftColor: status === 'RUNNING' ? theme.colors.accent : status === 'PAUSED' ? theme.colors.warning : theme.colors.primary }]} variant={theme.isDarkMode ? "dark" : "light"}>
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
             <Package size={14} color={theme.colors.primary} />
             <Text style={[styles.idText, { color: theme.colors.text }]}>{id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status === 'RUNNING' ? theme.colors.accent + '15' : theme.colors.warning + '15' }]}>
             <ActivityIndicator status={status} theme={theme} />
             <Text style={[styles.statusText, { color: status === 'RUNNING' ? theme.colors.accent : theme.colors.warning }]}>{status}</Text>
          </View>
        </View>

        <Text style={[styles.productName, { color: theme.colors.text }]}>{product}</Text>
        
        <View style={styles.progressSection}>
           <View style={styles.progressMeta}>
              <Text style={[styles.progressLabel, { color: theme.colors.textLight }]}>{t('PRODUCTION.PROGRESS')}</Text>
              <Text style={[styles.progressVal, { color: theme.colors.text }]}>{progress}%</Text>
           </View>
           <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: status === 'RUNNING' ? theme.colors.accent : theme.colors.warning }]} />
           </View>
        </View>

        <View style={styles.cardFooter}>
           <View style={styles.metaBox}>
              <Text style={[styles.metaLabel, { color: theme.colors.textLight }]}>{t('PRODUCTION.TARGET')}</Text>
              <Text style={[styles.metaVal, { color: theme.colors.text }]}>{quantity} {t('COMMON.UNITS')}</Text>
           </View>
           
           <TouchableOpacity style={[styles.controlBtn, { backgroundColor: theme.colors.surface }]} onPress={handleControl}>
              {status === 'RUNNING' ? <Pause size={16} color={theme.colors.warning} /> : <Play size={16} color={theme.colors.accent} />}
           </TouchableOpacity>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const ActivityIndicator = ({ status, theme }: any) => {
  if (status === 'RUNNING') return <Zap size={10} color={theme.colors.accent} fill={theme.colors.accent} />;
  return <Clock size={10} color={theme.colors.warning} />;
};

export default function ProductionScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { colors } = theme;

  const orders = [
    { id: "PO-8420", product: "TECH_WIDGET_ALPHA_V2", quantity: 500, progress: 78, status: "RUNNING" },
    { id: "PO-8421", product: "HYBRID_MODULE_X", quantity: 1200, progress: 45, status: "PAUSED" },
    { id: "PO-8422", product: "QUANTUM_CELL_CORE", quantity: 300, progress: 12, status: "RUNNING" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: t('PRODUCTION.TITLE'), headerTransparent: true, headerTintColor: theme.colors.text }} />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('PRODUCTION.TITLE')}</Text>
          <Settings color={theme.colors.primary} size={24} />
        </View>

        {/* 1. EFFICIENCY GAUGE */}
        <View style={styles.gaugeContainer}>
           <GlassCard style={styles.gaugeCard} variant="dark">
              <View style={styles.gaugeHeader}>
                 <Zap size={16} color={colors.accent} fill={colors.accent} />
                 <Text style={styles.gaugeTitle}>{t('PRODUCTION.EFFICIENCY')}</Text>
              </View>
              <Text style={styles.gaugeVal}>94.2%</Text>
              <View style={styles.gaugeBar}>
                 <View style={[styles.gaugeFill, { width: '94.2%', backgroundColor: colors.accent }]} />
              </View>
              <Text style={styles.gaugeSub}>{t('PRODUCTION.PEAK_CAPACITY')}</Text>
           </GlassCard>
        </View>

        {/* 2. ACTIVE ORDERS */}
        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('PRODUCTION.BATCH')}</Text>
           <Clock size={14} color={colors.primary} />
        </View>

        {orders.map((order, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 100)}>
             <ProductionOrder {...order} theme={theme} t={t} />
          </Animated.View>
        ))}

        <TouchableOpacity style={[styles.newBtn, { backgroundColor: colors.primary }]}>
           <Text style={styles.newBtnText}>{t('PRODUCTION.START')}</Text>
           <ChevronRight size={16} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 110, paddingBottom: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  
  gaugeContainer: { marginBottom: 32 },
  gaugeCard: { padding: 24, borderRadius: 32 },
  gaugeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  gaugeTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  gaugeVal: { color: '#fff', fontSize: 32, fontWeight: '900', fontStyle: 'italic', marginBottom: 16 },
  gaugeBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  gaugeFill: { height: '100%', borderRadius: 3 },
  gaugeSub: { color: '#fff', fontSize: 8, fontWeight: '900', opacity: 0.6 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  
  cardWrapper: { marginBottom: 16 },
  card: { padding: 20, borderRadius: 24, borderLeftWidth: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 8, fontWeight: '900' },
  
  productName: { fontSize: 14, fontWeight: '900', fontStyle: 'italic', marginBottom: 20 },
  
  progressSection: { marginBottom: 20 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 7, fontWeight: '900' },
  progressVal: { fontSize: 10, fontWeight: '900' },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  metaBox: { gap: 2 },
  metaLabel: { fontSize: 7, fontWeight: '900' },
  metaVal: { fontSize: 12, fontWeight: '900' },
  
  controlBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderRadius: 20, marginTop: 16 },
  newBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});
