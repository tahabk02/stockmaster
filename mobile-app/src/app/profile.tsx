import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  LogOut,
  User,
  Settings,
  Bell,
  ShieldCheck,
  Moon,
  ChevronRight,
  Globe,
  Zap,
  Lock,
  Cpu,
  Fingerprint,
  Activity,
  Database,
  Sun,
  Terminal,
  ShieldAlert,
  Radar,
  Key
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import { useAuthStore } from "../store/auth.store";
import { useThemeStore } from "../store/theme.store";
import api from "../api/client";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { AccountPortal } from "../components/AccountPortal";

const { width } = Dimensions.get("window");

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { user, logout, setAuth, token } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "PORTAL">("PORTAL");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [uptime, setUptime] = useState("00:00:00:00");
  const [stats, setStats] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", jobTitle: "", bio: "" });

  const { colors, typography, spacing } = theme;
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const loadStats = async () => {
       try {
          const { data } = await api.get("dashboard/stats");
          if (data.success) setStats(data.data);
       } catch (e) {}
    };
    loadStats();
  }, []);

  // Cinematic Animations
  const scanLinePos = useSharedValue(0);
  useEffect(() => {
    scanLinePos.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, []);

  const animatedScanStyle = useAnimatedStyle(() => ({
    top: `${scanLinePos.value * 100}%`,
  }));

  useEffect(() => {
    if (!user) return;
    setNotificationsEnabled(user.preferences?.notifications ?? true);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
      bio: user.bio || "",
    });
  }, [user]);

  // High-precision forensic timer
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      const ms = Math.floor((diff % 1000) / 10).toString().padStart(2, "0");
      setUptime(`${h}:${m}:${s}:${ms}`);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("TERMINATE_SESSION", "ENCRYPTED_LOGOUT_PROTOCOL_INITIATED?", [
      { text: "ABORT", style: "cancel" },
      { text: "TERMINATE", onPress: async () => { await logout(); router.replace("/login"); }, style: "destructive" }
    ]);
  };

  const changeLanguage = async (lng: string) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    i18n.changeLanguage(lng);
    try { await api.patch("users/preferences", { language: lng }); } catch (e) {}
  };

  const handleToggleTheme = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await toggleTheme();
    try { await api.patch("users/preferences", { darkMode: !isDarkMode }); } catch (e) {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={isDarkMode ? ["#020617", "#0f172a", "#1e293b"] : ["#f8fafc", "#f1f5f9", "#e2e8f0"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.fixedHeader}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={colors.text} size={normalize(20)} />
         </TouchableOpacity>
         <View style={styles.tabSwitcher}>
            <TouchableOpacity 
               onPress={() => { setActiveTab("PORTAL"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
               style={[styles.tabBtn, activeTab === "PORTAL" && { backgroundColor: colors.primary }]}
            >
               <Text style={[styles.tabText, { color: activeTab === "PORTAL" ? "#fff" : colors.textLight, ...typography.pro, fontSize: 8 }]}>CLIENT_PORTAL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               onPress={() => { setActiveTab("SETTINGS"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
               style={[styles.tabBtn, activeTab === "SETTINGS" && { backgroundColor: colors.primary }]}
            >
               <Text style={[styles.tabText, { color: activeTab === "SETTINGS" ? "#fff" : colors.textLight, ...typography.pro, fontSize: 8 }]}>NODE_SETTINGS</Text>
            </TouchableOpacity>
         </View>
         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut color={colors.danger} size={normalize(18)} />
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "PORTAL" ? (
           <AccountPortal user={user} stats={stats} />
        ) : (
           <Animated.View entering={FadeInDown}>
              {/* 1. IDENTITY MATRIX (Settings) */}
              <View style={styles.identityMatrix}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatarRing, { borderColor: colors.primary }]} />
                    <View style={[styles.avatarGlass, { backgroundColor: colors.surface + '20', borderColor: colors.border }]}>
                      <Text style={[styles.avatarText, { color: colors.text, ...typography.pro }]}>{user?.name?.charAt(0) || "X"}</Text>
                      <Animated.View style={[styles.scanLine, { backgroundColor: colors.primary }, animatedScanStyle]} />
                    </View>
                    <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.levelText}>L5</Text>
                    </View>
                </View>
                <Text style={[styles.userName, { color: colors.text, ...typography.pro }]}>{user?.name || "OPERATOR_01"}</Text>
                <Text style={[styles.userRole, { color: colors.primary, ...typography.pro, fontSize: normalize(10) }]}>// {user?.role || "SYSTEM_ADMIN"}</Text>
              </View>

              {/* 2. FORENSIC GRID */}
              <Text style={[styles.sectionLabel, { color: colors.textLight, ...typography.pro, textAlign: isRTL ? 'right' : 'left' }]}>FORENSIC_METRICS</Text>
              <GlassCard style={styles.forensicCard}>
                <View style={[styles.forensicRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <ForensicItem icon={<Database size={12} color={colors.primary} />} label="NODE_ID" value={user?._id?.substring(0,8).toUpperCase() || "UNK_NODE"} theme={theme} />
                    <View style={[styles.dividerV, { backgroundColor: colors.border }]} />
                    <ForensicItem icon={<Activity size={12} color={colors.accent} />} label="UPTIME" value={uptime} theme={theme} color={colors.accent} />
                </View>
              </GlassCard>

              {/* 3. CONTROL MATRIX */}
              <Text style={[styles.sectionLabel, { color: colors.textLight, ...typography.pro, textAlign: isRTL ? 'right' : 'left' }]}>CONTROL_MATRIX</Text>
              <GlassCard style={styles.controlMatrix}>
                <ControlItem 
                  icon={<Bell size={18} color={colors.primary} />} 
                  label="NOTIFICATIONS" 
                  desc="SIGNAL_INTERCEPT" 
                  value={notificationsEnabled} 
                  onPress={setNotificationsEnabled} 
                  isSwitch 
                  theme={theme} 
                />
                <View style={[styles.dividerH, { backgroundColor: colors.border, marginHorizontal: spacing.md }]} />
                <ControlItem 
                  icon={isDarkMode ? <Moon size={18} color={colors.accent} /> : <Sun size={18} color={colors.warning} />} 
                  label="STEALTH_MODE" 
                  desc={isDarkMode ? "OLED_BLACK_ACTIVE" : "SOLAR_LIGHT_ACTIVE"} 
                  value={isDarkMode} 
                  onPress={handleToggleTheme} 
                  isSwitch 
                  theme={theme} 
                />
                <View style={[styles.dividerH, { backgroundColor: colors.border, marginHorizontal: spacing.md }]} />
                <ControlItem 
                  icon={<Globe size={18} color={colors.primary} />} 
                  label={t("PROFILE.LANGUAGE")} 
                  desc={i18n.language.toUpperCase()} 
                  onPress={() => {}} 
                  theme={theme} 
                >
                    <View style={styles.langSwitch}>
                      {['en', 'fr', 'ar'].map(l => (
                        <TouchableOpacity key={l} onPress={() => changeLanguage(l)} style={[styles.langDot, i18n.language === l && { backgroundColor: colors.primary }]}>
                            <Text style={[styles.langDotText, { color: i18n.language === l ? '#fff' : colors.textLight, fontWeight: '900' }]}>
                              {l === 'ar' ? 'العربية' : l === 'fr' ? 'FR' : 'EN'}
                            </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                </ControlItem>
              </GlassCard>

              {/* 4. SECURITY TERMINAL */}
              <TouchableOpacity style={[styles.terminalAction, { borderColor: colors.danger }]} onPress={handleLogout}>
                <Terminal size={16} color={colors.danger} />
                <Text style={[styles.terminalText, { color: colors.danger, ...typography.pro }]}>TERMINATE_SECURE_SESSION</Text>
              </TouchableOpacity>
           </Animated.View>
        )}

        <View style={styles.footer}>
           <Text style={[styles.footerText, { color: colors.textLight, ...typography.pro }]}>SYS_KERNEL_v2.5.0_HARDENED</Text>
           <Text style={[styles.footerText, { color: colors.textLight, ...typography.pro }]}>NODE_STATUS: {Platform.OS.toUpperCase()}_LIVE</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const ForensicItem = ({ icon, label, value, theme, color }: any) => (
  <View style={styles.forensicItem}>
     <View style={styles.forensicHdr}>
        {icon}
        <Text style={[styles.forensicLabel, { color: theme.colors.textLight, ...theme.typography.pro, fontSize: normalize(7) }]}>{label}</Text>
     </View>
     <Text style={[styles.forensicVal, { color: color || theme.colors.text, ...theme.typography.pro, fontSize: normalize(11) }]} numberOfLines={1}>{value}</Text>
  </View>
);

const ControlItem = ({ icon, label, desc, value, onPress, isSwitch, theme, children }: any) => (
  <View style={styles.controlItem}>
     <View style={styles.controlLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.surface + '10', borderColor: theme.colors.border }]}>
           {icon}
        </View>
        <View>
           <Text style={[styles.controlLabel, { color: theme.colors.text, ...theme.typography.pro, fontSize: normalize(12) }]}>{label}</Text>
           <Text style={[styles.controlDesc, { color: theme.colors.textLight, ...theme.typography.pro, fontSize: normalize(7), opacity: 0.6 }]}>{desc}</Text>
        </View>
     </View>
     {isSwitch ? (
       <Switch 
         value={value} 
         onValueChange={onPress} 
         trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primary }}
         thumbColor="#fff"
       />
     ) : children || <ChevronRight size={16} color={theme.colors.textLight} />}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, zIndex: 10 },
  tabSwitcher: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tabText: { letterSpacing: 1 },
  logoutBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.2)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(244, 63, 94, 0.05)' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  badgeText: { fontSize: 8, letterSpacing: 1 },
  editBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  identityMatrix: { alignItems: 'center' },
  avatarContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarRing: { ...StyleSheet.absoluteFillObject, borderRadius: 60, borderWidth: 1, opacity: 0.3 },
  avatarGlass: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarText: { fontSize: 32, fontStyle: 'italic' },
  scanLine: { position: 'absolute', width: '100%', height: 2, shadowColor: '#fff', shadowOpacity: 0.5, shadowRadius: 5 },
  levelBadge: { position: 'absolute', bottom: 5, right: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(0,0,0,0.5)' },
  levelText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  
  userName: { fontSize: 24, letterSpacing: 1, marginBottom: 4 },
  userRole: { opacity: 0.6 },
  
  sectionLabel: { fontSize: 10, letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
  forensicCard: { padding: 20, borderRadius: 32, marginBottom: 32 },
  forensicRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  forensicItem: { flex: 1, gap: 4 },
  forensicHdr: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  forensicLabel: { opacity: 0.6 },
  forensicVal: { fontStyle: 'italic' },
  dividerV: { width: 1, height: '100%', opacity: 0.5 },
  dividerH: { height: 1, width: '100%', opacity: 0.5 },
  
  controlMatrix: { padding: 8, borderRadius: 32, marginBottom: 32 },
  controlItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  controlLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  controlLabel: { letterSpacing: 0.5 },
  controlDesc: { marginTop: 2 },
  
  langSwitch: { flexDirection: 'row', gap: 8 },
  langDot: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  langDotText: { fontSize: 8, fontWeight: '900' },
  
  terminalAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', marginTop: 8 },
  terminalText: { fontSize: 11, letterSpacing: 1 },
  
  footer: { alignItems: 'center', marginTop: 40, gap: 4 },
  footerText: { fontSize: 7, opacity: 0.4, letterSpacing: 1 }
});
