import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Users, UserCheck, Clock, Shield, Activity, ChevronRight, Phone, MessageSquare, Mail, Award, Zap } from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";

const HRScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { colors } = theme;

  const operators = [
    { name: "ALEX_SYNC", role: t('HR.ROLE_OPERATOR'), status: "ACTIVE", lastSeen: "2m ago", points: 2450, phone: "+1234567890", email: "alex@stockmaster.pro" },
    { name: "ERIK_NODES", role: t('HR.ROLE_SECURITY'), status: "OFFLINE", lastSeen: "4h ago", points: 1890, phone: "+0987654321", email: "erik@stockmaster.pro" },
    { name: "SARA_FLUX", role: t('HR.ROLE_LOGISTICS'), status: "ACTIVE", lastSeen: "Now", points: 3100, phone: "+1122334455", email: "sara@stockmaster.pro" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: t('HR.TITLE'), headerTransparent: true, headerTintColor: theme.colors.text }} />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('HR.TITLE')}</Text>
          <Users color={theme.colors.primary} size={24} />
        </View>

        {/* 1. OVERVIEW STATS */}
        <View style={styles.overviewRow}>
           <GlassCard style={styles.statCard} variant="dark">
              <View style={styles.statTop}>
                 <Users size={16} color={colors.primary} />
                 <Text style={styles.statVal}>42</Text>
              </View>
              <Text style={styles.statLabel}>{t('HR.NODES')}</Text>
           </GlassCard>
           
           <GlassCard style={styles.statCard} variant="dark">
              <View style={styles.statTop}>
                 <Zap size={16} color="#10b981" fill="#10b981" />
                 <Text style={[styles.statVal, { color: '#10b981' }]}>38</Text>
              </View>
              <Text style={styles.statLabel}>{t('HR.ONLINE')}</Text>
           </GlassCard>
        </View>

        {/* 2. OPERATOR LIST */}
        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('HR.ACTIVE_LIST')}</Text>
           <Shield size={14} color={colors.primary} />
        </View>
        
        {operators.map((op, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 100)}>
             <TeamNode {...op} theme={theme} t={t} />
          </Animated.View>
        ))}

        <TouchableOpacity style={[styles.inviteBtn, { borderColor: colors.primary }]}>
           <Text style={[styles.inviteText, { color: colors.primary }]}>{t('HR.INVITE')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const TeamNode = ({ name, role, status, lastSeen, points, phone, email, theme, t }: any) => {
  const handleContact = async (type: 'phone' | 'email') => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = type === 'phone' ? `tel:${phone}` : `mailto:${email}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
      <GlassCard style={[styles.card, { borderLeftColor: status === 'ACTIVE' ? '#10b981' : '#64748b' }]} variant={theme.isDarkMode ? "dark" : "light"}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarGroup}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary + '40' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{name[0]}</Text>
              {status === 'ACTIVE' && <View style={[styles.onlineDot, { backgroundColor: '#10b981', borderColor: theme.colors.surface }]} />}
            </View>
            <View>
              <Text style={[styles.nameText, { color: theme.colors.text }]}>{name}</Text>
              <Text style={[styles.roleText, { color: theme.colors.textLight }]}>{role}</Text>
            </View>
          </View>
          
          <View style={[styles.pointsBadge, { backgroundColor: theme.colors.warning + '15' }]}>
             <Award size={10} color={theme.colors.warning} />
             <Text style={[styles.pointsText, { color: theme.colors.warning }]}>{points} XP</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]} onPress={() => handleContact('phone')}>
              <Phone size={14} color={theme.colors.primary} />
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]} onPress={() => handleContact('email')}>
              <Mail size={14} color={theme.colors.accent} />
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}>
              <MessageSquare size={14} color={theme.colors.text} />
           </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.meta}>
            <Clock size={10} color={theme.colors.textLight} />
            <Text style={[styles.metaText, { color: theme.colors.textLight }]}>{t('HR.LAST_SYNC')}: <Text style={{ color: theme.colors.text }}>{lastSeen}</Text></Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status === 'ACTIVE' ? '#10b98115' : '#64748b15' }]}>
             <Activity size={8} color={status === 'ACTIVE' ? '#10b981' : '#64748b'} />
             <Text style={[styles.statusText, { color: status === 'ACTIVE' ? '#10b981' : '#64748b' }]}>{t(`COMMON.${status}`)}</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

export default HRScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 110, paddingBottom: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  
  overviewRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 20, borderRadius: 24, gap: 8 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  
  cardWrapper: { marginBottom: 16 },
  card: { padding: 20, borderRadius: 28, borderLeftWidth: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  avatarGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  avatarText: { fontSize: 18, fontWeight: "900" },
  onlineDot: { position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  
  nameText: { fontSize: 16, fontWeight: "900", fontStyle: "italic", textTransform: 'uppercase' },
  roleText: { fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pointsText: { fontSize: 9, fontWeight: '900' },
  
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 9, fontWeight: "700" },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 8, fontWeight: '900' },
  
  inviteBtn: { padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', marginTop: 16 },
  inviteText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 }
});
