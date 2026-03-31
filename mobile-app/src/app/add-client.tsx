import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  ShieldCheck,
  Briefcase
} from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import clientService, { Client } from "../services/client.service";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";

export default function AddClientPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const isRTL = i18n.language === 'ar';

  const [form, setForm] = useState<Partial<Client>>({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "INDIVIDUAL",
    creditLimit: 0,
    status: "ACTIVE"
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const data = await clientService.getClientById(id as string);
      setForm(data);
    } catch (e) {
      Alert.alert("Error", "Failed to fetch client data for editing.");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      Alert.alert(t('COMMON.ERROR'), "Name and Phone are mandatory protocols.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await clientService.updateClient(id as string, form);
      } else {
        await clientService.createClient(form);
      }
      
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert(t('COMMON.ERROR'), e.response?.data?.message || "Protocol Violation: Failed to sync client.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, icon: any, key: keyof Client, keyboardType: any = "default", placeholder: string = "") => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={styles.iconBox}>
            {icon}
        </View>
        <TextInput
          style={[styles.input, { color: colors.text }, isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }]}
          value={String(form[key] || "")}
          onChangeText={(val) => setForm({ ...form, [key]: key === 'creditLimit' ? Number(val) : val })}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight + '50'}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? t('CLIENTS.EDIT_TITLE') || "EDIT CLIENT" : t('CLIENTS.ADD_TITLE') || "NEW CLIENT"}
          </Text>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Save color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.formCard}>
            <View style={[styles.typeSelector, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity 
                style={[
                    styles.typeBtn, 
                    form.type === 'INDIVIDUAL' && { backgroundColor: colors.primary },
                    { borderColor: colors.border }
                ]}
                onPress={() => setForm({...form, type: 'INDIVIDUAL'})}
              >
                <User size={16} color={form.type === 'INDIVIDUAL' ? "#fff" : colors.textLight} />
                <Text style={[styles.typeBtnText, { color: form.type === 'INDIVIDUAL' ? "#fff" : colors.textLight }]}>INDIVIDUAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                    styles.typeBtn, 
                    form.type === 'COMPANY' && { backgroundColor: colors.primary },
                    { borderColor: colors.border }
                ]}
                onPress={() => setForm({...form, type: 'COMPANY'})}
              >
                <Building2 size={16} color={form.type === 'COMPANY' ? "#fff" : colors.textLight} />
                <Text style={[styles.typeBtnText, { color: form.type === 'COMPANY' ? "#fff" : colors.textLight }]}>COMPANY</Text>
              </TouchableOpacity>
            </View>

            {renderInput("FULL NAME", <User size={18} color={colors.primary} />, "name", "default", "Enter registry name")}
            {renderInput("PHONE LINE", <Phone size={18} color={colors.accent} />, "phone", "phone-pad", "+X XXX XXX XXX")}
            {renderInput("DATA CHANNEL (EMAIL)", <Mail size={18} color={colors.warning} />, "email", "email-address", "client@domain.com")}
            {renderInput("COORDINATES (ADDRESS)", <MapPin size={18} color={colors.danger} />, "address", "default", "Physical location")}
            {renderInput("CREDIT LIMIT", <ShieldCheck size={18} color={colors.primary} />, "creditLimit", "numeric", "0.00")}

            <View style={[styles.switchContainer, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textLight }]}>REGISTRY STATUS</Text>
                <Text style={[styles.statusText, { color: colors.text }]}>{form.status === 'ACTIVE' ? "OPERATIONAL" : "SUSPENDED"}</Text>
              </View>
              <Switch 
                value={form.status === 'ACTIVE'}
                onValueChange={(val) => setForm({...form, status: val ? 'ACTIVE' : 'INACTIVE'})}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={form.status === 'ACTIVE' ? colors.primary : colors.textLight}
              />
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  saveBtn: { padding: 12, borderRadius: 14, shadowOpacity: 0.3, shadowRadius: 10 },
  scrollContent: { padding: 24 },
  formCard: { padding: 24, gap: 20 },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  typeBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  typeBtnText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  inputContainer: { gap: 8 },
  label: { fontSize: 8, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  inputWrapper: { height: 56, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  iconBox: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, fontSize: 14, fontWeight: '700', paddingRight: 16 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  statusText: { fontSize: 12, fontWeight: '900', marginTop: 4 }
});
