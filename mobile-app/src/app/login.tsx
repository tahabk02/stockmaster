import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView
} from "react-native";
import api from "../api/client";
import { useRouter } from "expo-router";
import { useAppTheme, normalize } from "../theme";
import { 
  Lock, 
  Mail, 
  ChevronRight, 
  ShieldCheck, 
  Fingerprint, 
  User, 
  Phone, 
  ArrowLeft,
  Cpu,
  Zap,
  LayoutGrid
} from "lucide-react-native";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Layout
} from "react-native-reanimated";
import { useAuthStore } from "../store/auth.store";
import { BiometricService } from "../services/auth.service";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode, typography, spacing } = theme;
  const router = useRouter();
  
  // Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  const isRTL = i18n.language === 'ar';

  // Cinematic Background Animation
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.1
  }));

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLogin(!isLogin);
  };

  const checkBiometrics = async () => {
    const available = await BiometricService.isAvailable();
    if (available) {
      const success = await BiometricService.authenticate();
      if (success) {
        // Biometric success logic (needs backend token refresh or stored creds)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleAction = async () => {
    if (!email || !password || (!isLogin && !name)) {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t("COMMON.ERROR"), "REQUIRED_FIELDS_MISSING_PROTOCOL");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const payload = isLogin 
        ? { email: email.trim().toLowerCase(), password }
        : { name, email: email.trim().toLowerCase(), password, phone, role: "ADMIN" };

      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;

      if (token) {
        if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const store = useAuthStore.getState();
        await store.setAuth(token, user);
        router.replace("/");
      }
    } catch (error: any) {
      if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || "CORE_AUTH_FAILURE";
      Alert.alert("SECURITY_ALERT", message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. NEURAL BACKGROUND */}
      <View style={styles.bgOverlay}>
        <Animated.View style={[styles.pulseCircle, { borderColor: colors.primary }, animatedPulse]} />
        <LinearGradient colors={['#000', colors.background]} style={StyleSheet.absoluteFill} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 2. HUD HEADER */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <View style={styles.logoGrid}>
              <GlassCard variant="primary" intensity={40} style={styles.logoBox}>
                <ShieldCheck color="#fff" size={normalize(40)} strokeWidth={2} />
              </GlassCard>
              <View style={styles.logoLines}>
                <View style={[styles.hLine, { backgroundColor: colors.primary }]} />
                <View style={[styles.hLine, { backgroundColor: colors.accent, width: '60%' }]} />
              </View>
            </View>
            <Text style={[styles.brandTitle, { color: '#fff', ...typography.pro, fontSize: normalize(32) }]}>
              STOCK<Text style={{ color: colors.primary, fontStyle: 'italic' }}>MASTER</Text>
            </Text>
            <View style={styles.statusRow}>
              <PulseIndicator color={colors.accent} size={6} />
              <Text style={[styles.statusLabel, { color: colors.accent, ...typography.pro }]}>
                {isLogin ? "PROTOCOL_ALPHA_READY" : "NEW_NODE_PROVISIONING"}
              </Text>
            </View>
          </Animated.View>

          {/* 3. CONTROL TERMINAL (Form) */}
          <Animated.View layout={Layout.springify()} entering={FadeInDown.delay(400)}>
            <GlassCard variant="dark" intensity={60} style={styles.formTerminal}>
              <View style={styles.terminalHeader}>
                <Cpu size={14} color={colors.primary} />
                <Text style={[styles.terminalTitle, { color: colors.primary, ...typography.pro }]}>
                  {isLogin ? "AUTH_TERMINAL_v4" : "CORE_REGISTRATION_v1"}
                </Text>
              </View>

              {!isLogin && (
                <Animated.View entering={FadeInDown} style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textLight, ...typography.pro }]}>IDENT_NAME</Text>
                  <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                    <User size={18} color={colors.primary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="OPERATOR_NAME"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={name}
                      onChangeText={setName}
                      style={[styles.input, { color: '#fff' }]}
                    />
                  </View>
                </Animated.View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textLight, ...typography.pro }]}>NET_ADDRESS</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <Mail size={18} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="CLIENT_EMAIL"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    style={[styles.input, { color: '#fff' }]}
                  />
                </View>
              </View>

              {!isLogin && (
                <Animated.View entering={FadeInDown} style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textLight, ...typography.pro }]}>SIGNAL_NODE</Text>
                  <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                    <Phone size={18} color={colors.primary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="TELEMETRY_PHONE"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={phone}
                      onChangeText={setPhone}
                      style={[styles.input, { color: '#fff' }]}
                    />
                  </View>
                </Animated.View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textLight, ...typography.pro }]}>KEY_HASH</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <Lock size={18} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="SECURE_PASSWORD"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[styles.input, { color: '#fff' }]}
                  />
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.submitBtn, { backgroundColor: colors.primary }]} 
                onPress={handleAction}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <View style={styles.btnContent}>
                    <Text style={[styles.btnText, { ...typography.pro }]}>
                      {isLogin ? "EXECUTE_LOGIN" : "INITIALIZE_NODE"}
                    </Text>
                    <ChevronRight color="#fff" size={20} />
                  </View>
                )}
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity onPress={checkBiometrics} style={styles.biometricArea}>
                  <Fingerprint color={colors.accent} size={32} />
                  <Text style={[styles.bioLabel, { color: colors.accent, ...typography.pro }]}>BIOMETRIC_BYPASS</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>

          {/* 4. MODE SWITCHER */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
            <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
              <Text style={[styles.toggleText, { color: colors.textLight, ...typography.pro }]}>
                {isLogin ? "NO_NODE?_REGISTER_NEW" : "EXISTING_NODE?_LOGIN"}
              </Text>
              <Zap size={14} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.sysMeta}>
              <Text style={[styles.metaText, { color: colors.textLight, opacity: 0.3, ...typography.pro }]}>
                ZENITH_OS_v2.5 // ENCRYPTED_TUNNEL_ACTIVE
              </Text>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  pulseCircle: { width: width * 1.5, height: width * 1.5, borderRadius: width, borderWidth: 20 },
  content: { flex: 1 },
  scrollContent: { padding: 32, paddingTop: 60, paddingBottom: 100 },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logoGrid: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  logoBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  logoLines: { gap: 8, width: 60 },
  hLine: { height: 4, borderRadius: 2 },
  brandTitle: { letterSpacing: -1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  statusLabel: { fontSize: 8, letterSpacing: 1 },
  
  formTerminal: { padding: 24, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, opacity: 0.6 },
  terminalTitle: { fontSize: 10, letterSpacing: 2 },
  
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 8, letterSpacing: 1.5, marginBottom: 8, opacity: 0.4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  inputIcon: { opacity: 0.6 },
  input: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontWeight: '800', fontSize: 13 },
  
  submitBtn: { marginTop: 10, padding: 20, borderRadius: 20, shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  btnContent: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  btnText: { color: '#fff', fontSize: 14, letterSpacing: 2 },
  
  biometricArea: { marginTop: 24, alignItems: 'center', gap: 8, opacity: 0.6 },
  bioLabel: { fontSize: 8, letterSpacing: 1 },
  
  footer: { marginTop: 32, alignItems: 'center', gap: 20 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  toggleText: { fontSize: 9, letterSpacing: 1 },
  sysMeta: { marginTop: 20 },
  metaText: { fontSize: 7, letterSpacing: 1 }
});
