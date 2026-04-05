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
  useWindowDimensions,
  Image,
  ScrollView,
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
} from "lucide-react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Layout,
} from "react-native-reanimated";
import { useAuthStore } from "../store/auth.store";
import { BiometricService } from "../services/auth.service";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors, typography, isDarkMode } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  // Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Cinematic Background Animation
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3000 }),
        withTiming(1, { duration: 3000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.05,
  }));

  const toggleMode = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLogin(!isLogin);
  };

  const checkBiometrics = async () => {
    const available = await BiometricService.isAvailable();
    if (available) {
      const success = await BiometricService.authenticate();
      if (success) {
        if (Platform.OS !== "web")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleAction = async () => {
    if (!email || !password || (!isLogin && !name)) {
      if (Platform.OS !== "web")
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      Alert.alert(t("COMMON.ERROR"), "REQUIRED_FIELDS_MISSING_PROTOCOL");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const payload = isLogin
        ? { email: email.trim().toLowerCase(), password }
        : {
            name,
            email: email.trim().toLowerCase(),
            password,
            phone,
            role: "ADMIN",
          };

      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;

      if (token) {
        if (Platform.OS !== "web")
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        const store = useAuthStore.getState();
        await store.setAuth(token, user);
        router.replace("/dashboard");
      }
    } catch (error: any) {
      if (Platform.OS !== "web")
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || "CORE_AUTH_FAILURE";
      Alert.alert("SECURITY_ALERT", message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#06060F" : colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* 1. CINEMATIC BACKGROUND IMAGE */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
          }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(6, 6, 15, 0.4)",
            "rgba(6, 6, 15, 0.95)",
            "rgba(6, 6, 15, 1)",
          ]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              borderColor: colors.primary,
              width: width * 1.5,
              height: width * 1.5,
              borderRadius: width,
            },
            animatedPulse,
          ]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: normalize(30) },
          ]}
        >
          {/* BACK TO LANDING */}
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={styles.backBtn}
          >
            <ArrowLeft size={normalize(18)} color={colors.primary} />
            <Text
              style={[
                styles.backText,
                { color: colors.primary, fontSize: normalize(10) },
              ]}
            >
              RETOUR_LANDING
            </Text>
          </TouchableOpacity>

          {/* 2. HUD HEADER */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <View style={styles.logoGrid}>
              <GlassCard
                variant="primary"
                intensity={40}
                style={[
                  styles.logoBox,
                  { width: normalize(70), height: normalize(70) },
                ]}
              >
                <ShieldCheck
                  color="#fff"
                  size={normalize(36)}
                  strokeWidth={2}
                />
              </GlassCard>
              <View style={styles.logoLines}>
                <View
                  style={[
                    styles.hLine,
                    { backgroundColor: colors.primary, height: normalize(4) },
                  ]}
                />
                <View
                  style={[
                    styles.hLine,
                    {
                      backgroundColor: "#34d399",
                      width: "60%",
                      height: normalize(4),
                    },
                  ]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.brandTitle,
                {
                  color: "#fff",
                  fontSize: normalize(28),
                  fontWeight: "900",
                  letterSpacing: -1,
                },
              ]}
            >
              STOCK
              <Text style={{ color: colors.primary, fontStyle: "italic" }}>
                MASTER
              </Text>
            </Text>
            <View style={styles.statusRow}>
              <PulseIndicator color={"#34d399"} size={6} />
              <Text
                style={[
                  styles.statusLabel,
                  {
                    color: "#34d399",
                    fontSize: normalize(8),
                    letterSpacing: 1,
                  },
                ]}
              >
                {isLogin ? "PROTOCOL_ALPHA_READY" : "NEW_NODE_PROVISIONING"}
              </Text>
            </View>
          </Animated.View>

          {/* 3. CONTROL TERMINAL (Form) */}
          <Animated.View
            layout={Layout.springify()}
            entering={FadeInDown.delay(400)}
          >
            <GlassCard
              variant="dark"
              intensity={60}
              style={[styles.formTerminal, { padding: normalize(20) }]}
            >
              <View style={styles.terminalHeader}>
                <Cpu size={normalize(12)} color={colors.primary} />
                <Text
                  style={[
                    styles.terminalTitle,
                    {
                      color: colors.primary,
                      fontSize: normalize(9),
                      letterSpacing: 2,
                    },
                  ]}
                >
                  {isLogin ? "AUTH_TERMINAL_v4" : "CORE_REGISTRATION_v1"}
                </Text>
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { fontSize: normalize(7) }]}>
                    IDENT_NAME
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: "rgba(255,255,255,0.1)" },
                    ]}
                  >
                    <User size={normalize(16)} color={colors.primary} />
                    <TextInput
                      placeholder="OPERATOR_NAME"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={name}
                      onChangeText={setName}
                      style={[styles.input, { fontSize: normalize(12) }]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: normalize(7) }]}>
                  NET_ADDRESS
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: "rgba(255,255,255,0.1)" },
                  ]}
                >
                  <Mail size={normalize(16)} color={colors.primary} />
                  <TextInput
                    placeholder="CLIENT_EMAIL"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, { fontSize: normalize(12) }]}
                  />
                </View>
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { fontSize: normalize(7) }]}>
                    SIGNAL_NODE
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: "rgba(255,255,255,0.1)" },
                    ]}
                  >
                    <Phone size={normalize(16)} color={colors.primary} />
                    <TextInput
                      placeholder="TELEMETRY_PHONE"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={phone}
                      onChangeText={setPhone}
                      style={[styles.input, { fontSize: normalize(12) }]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { fontSize: normalize(7) }]}>
                  KEY_HASH
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: "rgba(255,255,255,0.1)" },
                  ]}
                >
                  <Lock size={normalize(16)} color={colors.primary} />
                  <TextInput
                    placeholder="SECURE_PASSWORD"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[styles.input, { fontSize: normalize(12) }]}
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.primary, padding: normalize(18) },
                ]}
                onPress={handleAction}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={[styles.btnText, { fontSize: normalize(12) }]}>
                      {isLogin ? "EXECUTE_LOGIN" : "INITIALIZE_NODE"}
                    </Text>
                    <ChevronRight color="#fff" size={normalize(18)} />
                  </View>
                )}
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity
                  onPress={checkBiometrics}
                  style={styles.biometricArea}
                >
                  <Fingerprint color={"#34d399"} size={normalize(28)} />
                  <Text
                    style={[
                      styles.bioLabel,
                      { fontSize: normalize(7), color: "#34d399" },
                    ]}
                  >
                    BIOMETRIC_BYPASS
                  </Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>

          {/* 4. MODE SWITCHER */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
            <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
              <Text style={[styles.toggleText, { fontSize: normalize(9) }]}>
                {isLogin ? "NO_NODE?_REGISTER_NEW" : "EXISTING_NODE?_LOGIN"}
              </Text>
              <Zap size={normalize(12)} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.metaText, { fontSize: normalize(7) }]}>
              ZENITH_OS_v4.2 // ENCRYPTED_TUNNEL_ACTIVE
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pulseCircle: {
    position: "absolute",
    borderWidth: 20,
    top: "25%",
    left: "-25%",
  },
  content: { flex: 1 },
  scrollContent: { paddingVertical: 60, paddingBottom: 100 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
    opacity: 0.6,
  },
  backText: { fontWeight: "900", letterSpacing: 1 },
  header: { alignItems: "center", marginBottom: 40 },
  logoGrid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  logoBox: { borderRadius: 20, justifyContent: "center", alignItems: "center" },
  logoLines: { gap: 8, width: 60 },
  hLine: { borderRadius: 2 },
  brandTitle: { textTransform: "uppercase" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  statusLabel: { fontWeight: "900" },
  formTerminal: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    opacity: 0.6,
  },
  terminalTitle: { fontWeight: "900" },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    letterSpacing: 1.5,
    marginBottom: 8,
    opacity: 0.4,
    color: "#94a3b8",
    fontWeight: "900",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontWeight: "800",
    color: "#fff",
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: 14,
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  btnContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  btnText: { color: "#fff", fontWeight: "900", letterSpacing: 2 },
  biometricArea: { marginTop: 24, alignItems: "center", gap: 8, opacity: 0.6 },
  bioLabel: { fontWeight: "900", letterSpacing: 1 },
  footer: { marginTop: 32, alignItems: "center", gap: 20 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  toggleText: { color: "#94a3b8", fontWeight: "900", letterSpacing: 1 },
  metaText: {
    color: "#94a3b8",
    opacity: 0.3,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
