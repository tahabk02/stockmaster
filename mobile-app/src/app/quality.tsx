import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ShieldCheck, AlertTriangle, FileText, CheckCircle, XCircle, ChevronRight, Microscope, Thermometer, Scale } from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";

const ComplianceCard = ({ id, type, result, score, date, theme, t }: any) => {
  const router = useRouter();
  
  const handlePress = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Detail view
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper} onPress={handlePress}>
      <GlassCard style={[styles.card, { borderLeftColor: result === 'PASS' ? '#10b981' : '#ef4444' }]} variant={theme.isDarkMode ? "dark" : "light"}>
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
             <ShieldCheck size={14} color={theme.colors.primary} />
             <Text style={[styles.idText, { color: theme.colors.text }]}>{id}</Text>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: theme.colors.surface }]}>
             <Text style={[styles.dateText, { color: theme.colors.textLight }]}>{date}</Text>
          </View>
        </View>

        <View style={styles.mainRow}>
           <View style={styles.typeInfo}>
              <Text style={[styles.typeLabel, { color: theme.colors.textLight }]}>{t('QUALITY.PROTOCOL')}</Text>
              <Text style={[styles.typeVal, { color: theme.colors.text }]}>{type}</Text>
           </View>
           <View style={styles.scoreBox}>
              <Text style={[styles.scoreVal, { color: result === 'PASS' ? '#10b981' : '#ef4444' }]}>{score}%</Text>
              <Text style={[styles.scoreLabel, { color: theme.colors.textLight }]}>{t('QUALITY.INTEGRITY')}</Text>
           </View>
        </View>

        <View style={styles.cardFooter}>
           <View style={[styles.resultBadge, { backgroundColor: result === 'PASS' ? '#10b98115' : '#ef444415' }]}>
              {result === 'PASS' ? <CheckCircle size={12} color="#10b981" /> : <XCircle size={12} color="#ef4444" />}
              <Text style={[styles.resultText, { color: result === 'PASS' ? '#10b981' : '#ef4444' }]}>{t(`QUALITY.${result}`)}</Text>
           </View>
           <ChevronRight size={16} color={theme.colors.textLight} opacity={0.5} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

export default function QualityScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { colors } = theme;

  const checks = [
    { id: "QC-2024-89", type: "ISO_9001_AUDIT", result: "PASS", score: 98.5, date: "14:02 TODAY" },
    { id: "QC-2024-88", type: "THERMAL_STRESS_TEST", result: "FAIL", score: 42.0, date: "09:15 TODAY" },
    { id: "QC-2024-87", type: "STRUCTURAL_INTEGRITY", result: "PASS", score: 100, date: "YESTERDAY" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: t('QUALITY.TITLE'), headerTransparent: true, headerTintColor: theme.colors.text }} />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('QUALITY.CONTROL')}</Text>
          <Microscope color={theme.colors.primary} size={24} />
        </View>

        {/* 1. STATUS MONITOR */}
        <View style={styles.monitorRow}>
           <GlassCard style={styles.monitorCard} variant="dark">
              <ShieldCheck size={20} color={colors.accent} />
              <Text style={styles.monitorVal}>96%</Text>
              <Text style={styles.monitorLabel}>{t('QUALITY.COMPLIANCE')}</Text>
           </GlassCard>
           <GlassCard style={styles.monitorCard} variant="dark">
              <AlertTriangle size={20} color={colors.warning} />
              <Text style={styles.monitorVal}>2</Text>
              <Text style={styles.monitorLabel}>{t('QUALITY.INCIDENTS')}</Text>
           </GlassCard>
           <GlassCard style={styles.monitorCard} variant="dark">
              <FileText size={20} color={colors.primary} />
              <Text style={styles.monitorVal}>14</Text>
              <Text style={styles.monitorLabel}>{t('QUALITY.PENDING')}</Text>
           </GlassCard>
        </View>

        {/* 2. RECENT CHECKS */}
        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('QUALITY.RECENT')}</Text>
           <Scale size={14} color={colors.primary} />
        </View>

        {checks.map((check, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 100)}>
             <ComplianceCard {...check} theme={theme} t={t} />
          </Animated.View>
        ))}

        <TouchableOpacity style={[styles.auditBtn, { backgroundColor: colors.primary }]}>
           <Text style={styles.auditBtnText}>{t('QUALITY.INITIATE')}</Text>
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
  
  monitorRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  monitorCard: { flex: 1, padding: 16, alignItems: 'center', gap: 6 },
  monitorVal: { color: '#fff', fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  monitorLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 6, fontWeight: '900', textAlign: 'center' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  
  cardWrapper: { marginBottom: 16 },
  card: { padding: 20, borderRadius: 24, borderLeftWidth: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  dateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dateText: { fontSize: 8, fontWeight: '700' },
  
  mainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  typeInfo: { gap: 4 },
  typeLabel: { fontSize: 8, fontWeight: '900' },
  typeVal: { fontSize: 14, fontWeight: '900', fontStyle: 'italic' },
  scoreBox: { alignItems: 'flex-end', gap: 2 },
  scoreVal: { fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  scoreLabel: { fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  resultText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  auditBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderRadius: 20, marginTop: 16 },
  auditBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});
