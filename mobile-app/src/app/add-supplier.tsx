import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Save,
  ShieldCheck,
  Zap,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import api from "../api/client";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function AddSupplierPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    category: "",
    contactPerson: "",
  });

  const isRTL = i18n.language === "ar";

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("suppliers", form);
      if (data.success) {
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        }
        router.back();
      }
    } catch (e: any) {
      console.error("[AddSupplier] Registry Write Failure:", e);
      // Log server response details (if available) for easier debugging
      if (e.response) {
        console.error("[AddSupplier] Response data:", e.response.data);
        console.error("[AddSupplier] Response status:", e.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    key: string,
    icon: any,
    placeholder: string,
    keyboardType: any = "default",
  ) => (
    <View style={styles.inputContainer}>
      <Text
        style={[
          styles.inputLabel,
          { color: colors.textLight },
          isRTL && { textAlign: "right" },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDarkMode
              ? "rgba(0,0,0,0.2)"
              : "rgba(0,0,0,0.03)",
            borderColor: colors.border,
          },
          isRTL && { flexDirection: "row-reverse" },
        ]}
      >
        <View style={styles.iconBox}>{icon}</View>
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            isRTL && { textAlign: "right", marginRight: 12, marginLeft: 0 },
          ]}
          value={value}
          onChangeText={(txt) => setForm({ ...form, [key]: txt })}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight + "80"}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[styles.headerTop, isRTL && { flexDirection: "row-reverse" }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: colors.glass, borderColor: colors.border },
            ]}
          >
            <ArrowLeft
              color={colors.text}
              size={24}
              style={isRTL && { transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('SUPPLIERS.PROVISION')}
          </Text>
          <View
            style={[styles.badge, { backgroundColor: colors.primary + "15" }]}
          >
            <ShieldCheck color={colors.primary} size={18} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard
            style={styles.formCard}
            variant={isDarkMode ? "dark" : "light"}
          >
            {renderInput(
              t('SUPPLIERS.ENTITY_NAME'),
              form.name,
              "name",
              <User size={18} color={colors.primary} />,
              t('COMMON.REQUIRED'),
            )}
            {renderInput(
              t('SUPPLIERS.VOICE'),
              form.phone,
              "phone",
              <Phone size={18} color={colors.accent} />,
              t('COMMON.REQUIRED'),
              "phone-pad",
            )}
            {renderInput(
              t('SUPPLIERS.DATA'),
              form.email,
              "email",
              <Mail size={18} color={colors.warning} />,
              t('COMMON.OPTIONAL'),
              "email-address",
            )}
            {renderInput(
              t('SUPPLIERS.CATEGORY'),
              form.category,
              "category",
              <Briefcase size={18} color={colors.primary} />,
              t('COMMON.GENERAL_ASSET'),
            )}
            {renderInput(
              t('CLIENTS.COORD'),
              form.address,
              "address",
              <MapPin size={18} color={colors.accent} />,
              t('SUPPLIERS.ADDRESS_PLACEHOLDER'),
            )}
            {renderInput(
              t('SUPPLIERS.CONTACT_PERSON'),
              form.contactPerson,
              "contactPerson",
              <User size={18} color={colors.warning} />,
              t('SUPPLIERS.CONTACT_PLACEHOLDER'),
            )}
          </GlassCard>
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{t('COMMON.SAVE')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    fontStyle: "italic",
    textTransform: "uppercase",
  },
  badge: { padding: 10, borderRadius: 14 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  formCard: { padding: 24, gap: 20 },
  inputContainer: { gap: 8 },
  inputLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  input: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "700" },
  saveBtn: {
    marginTop: 32,
    height: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    fontStyle: "italic",
  },
});
