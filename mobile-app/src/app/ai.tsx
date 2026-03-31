import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Stack } from "expo-router";
import { Brain, Cpu, Zap, Search, Activity, Scan, Fingerprint, Shield, Send, Terminal } from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";
import api from "../api/client";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";

export default function AIScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const { data } = await api.post("ai/query", { query });
      setResponse(data);
      setHistory(prev => [{ query, response: data.response }, ...prev].slice(0, 5));
      setQuery("");
    } catch (e) {
      setResponse({ response: "LATTICE_ERROR: CONNECTION_TIMEOUT" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('AI.TITLE'), headerTransparent: true, headerTintColor: theme.colors.text }} />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. NEURAL CORE STATUS */}
        <View style={styles.header}>
           <Text style={[styles.title, { color: colors.text }]}>{t('AI.LATTICE')}</Text>
           <View style={[styles.statusBadge, { backgroundColor: colors.accent + '15' }]}>
              <Activity size={12} color={colors.accent} />
              <Text style={[styles.statusText, { color: colors.accent }]}>{t('AI.ONLINE')}</Text>
           </View>
        </View>

        <View style={styles.coreStats}>
           <StatBox icon={<Cpu size={14} color={colors.primary} />} label={t('AI.COMPUTE')} val="4.2 TFLOPS" theme={theme} />
           <StatBox icon={<Brain size={14} color={colors.accent} />} label={t('AI.SYNAPSE')} val="GEMINI_1.5" theme={theme} />
        </View>

        {/* 2. TERMINAL INTERFACE */}
        <GlassCard style={styles.terminal} variant="dark">
           <View style={styles.terminalHeader}>
              <Terminal size={12} color="#fff" opacity={0.5} />
              <Text style={styles.terminalTitle}>{t('AI.INPUT')}</Text>
           </View>
           
           <TextInput
              style={styles.input}
              placeholder={t('AI.PLACEHOLDER')}
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={query}
              onChangeText={setQuery}
              multiline
           />

           <TouchableOpacity 
             style={[styles.sendBtn, { backgroundColor: colors.primary }]} 
             onPress={handleQuery}
             disabled={loading}
           >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Send size={18} color="#fff" />}
           </TouchableOpacity>
        </GlassCard>

        {/* 3. SIGNAL RESPONSE */}
        {response && (
          <Animated.View entering={FadeInUp} style={styles.responseContainer}>
             <View style={styles.responseHeader}>
                <Zap size={14} color={colors.primary} fill={colors.primary} />
                <Text style={[styles.responseLabel, { color: colors.primary }]}>{t('AI.OUTPUT')}</Text>
             </View>
             <GlassCard style={styles.responseCard} variant={isDarkMode ? "dark" : "light"}>
                <Text style={[styles.responseText, { color: colors.text }]}>{response.response}</Text>
                <View style={styles.responseFooter}>
                   <Text style={[styles.timestamp, { color: colors.textLight }]}>{t('AI.COMPUTE_TIME')}: {response.compute_time || '840ms'}</Text>
                </View>
             </GlassCard>
          </Animated.View>
        )}

        {/* 4. HISTORY LOGS */}
        <Text style={[styles.historyTitle, { color: colors.textLight }]}>{t('AI.HISTORY')}</Text>
        {history.map((item, i) => (
          <Animated.View key={i} entering={FadeInRight.delay(i * 100)}>
            <TouchableOpacity style={styles.historyItem}>
               <Shield size={12} color={colors.textLight} />
               <Text style={[styles.historyText, { color: colors.text }]} numberOfLines={1}>{item.query}</Text>
               <ChevronRight size={14} color={colors.textLight} opacity={0.3} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const StatBox = ({ icon, label, val, theme }: any) => (
  <View style={[styles.statBox, { backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
    <View style={styles.statHdr}>
      {icon}
      <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>{label}</Text>
    </View>
    <Text style={[styles.statVal, { color: theme.colors.text }]}>{val}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 110, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  
  coreStats: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, gap: 8 },
  statHdr: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 7, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  statVal: { fontSize: 13, fontWeight: '900', fontStyle: 'italic' },
  
  terminal: { padding: 20, borderRadius: 28, height: 180, justifyContent: 'space-between' },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  terminalTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  input: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', paddingVertical: 10 },
  sendBtn: { alignSelf: 'flex-end', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  
  responseContainer: { marginTop: 32 },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  responseLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, fontStyle: 'italic' },
  responseCard: { padding: 24, borderRadius: 32 },
  responseText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  responseFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  timestamp: { fontSize: 8, fontWeight: '900', fontStyle: 'italic' },
  
  historyTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 40, marginBottom: 20 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  historyText: { flex: 1, fontSize: 12, fontWeight: '600' }
});
