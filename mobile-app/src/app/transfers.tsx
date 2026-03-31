import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  MapPin, 
  Package, 
  ScanLine,
  Check,
  ShieldCheck,
  Zap,
  Activity,
  Box
} from "lucide-react-native";
import { useAppTheme } from "../theme";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';

export default function TransfersPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [step, setStep] = useState(1);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");

  const isRTL = i18n.language === 'ar';

  const handleTransfer = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const handleStepPress = async (s: number) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStep(s);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* 1. CINEMATIC HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("DASHBOARD.TRANSFERS")}</Text>
          <View style={[styles.headerBadge, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '20' }]}>
            <ShieldCheck color={colors.accent} size={18} />
          </View>
        </View>

        {/* STEP INDICATOR */}
        <View style={[styles.progressContainer, isRTL && { flexDirection: 'row-reverse' }]}>
          {[1, 2, 3].map((s, idx) => (
            <React.Fragment key={s}>
              <TouchableOpacity 
                style={[styles.stepCircle, { backgroundColor: colors.glass, borderColor: colors.border }, step >= s && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => handleStepPress(s)}
              >
                <Text style={[styles.stepNum, { color: colors.textLight }, step >= s && { color: colors.white }]}>{s}</Text>
              </TouchableOpacity>
              {idx < 2 && <View style={[styles.stepLine, { backgroundColor: colors.border }, step > s && { backgroundColor: colors.primary }]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.sectionLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('TRANSFERS.ROUTING')}</Text>
        <GlassCard style={styles.formSection} variant={isDarkMode ? "dark" : "light"}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.primary }, isRTL && { textAlign: 'right' }]}>{t('TRANSFERS.SOURCE')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <MapPin size={16} color={colors.primary} />
              <TextInput 
                style={[styles.input, { color: colors.text }, isRTL && { textAlign: 'right' }]} 
                placeholder="ORIGIN_W_01" 
                placeholderTextColor={colors.textLight}
                value={source}
                onChangeText={setSource}
              />
            </View>
          </View>

          <View style={styles.flowDivider}>
            <View style={[styles.dashLine, { backgroundColor: colors.border }]} />
            <View style={[styles.dividerIcon, { backgroundColor: colors.glass }]}>
              <ArrowRightLeft size={14} color={colors.primary} />
            </View>
            <View style={[styles.dashLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.accent }, isRTL && { textAlign: 'right' }]}>{t('TRANSFERS.TARGET')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <MapPin size={16} color={colors.accent} />
              <TextInput 
                style={[styles.input, { color: colors.text }, isRTL && { textAlign: 'right' }]} 
                placeholder="DESTINATION_W_04" 
                placeholderTextColor={colors.textLight}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>
        </GlassCard>

        <Text style={[styles.sectionLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('TRANSFERS.ID')}</Text>
        <GlassCard style={styles.formSection} variant={isDarkMode ? "dark" : "light"}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.primary }, isRTL && { textAlign: 'right' }]}>{t('TRANSFERS.MANIFEST')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Package size={16} color={colors.primary} />
              <TextInput 
                style={[styles.input, { color: colors.text }, isRTL && { textAlign: 'right' }]} 
                placeholder="SKU_CORE" 
                placeholderTextColor={colors.textLight}
                value={item}
                onChangeText={setItem}
              />
              <TouchableOpacity style={[styles.scanAction, { backgroundColor: colors.primary }]}>
                <ScanLine size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 24 }]}>
            <Text style={[styles.label, { color: colors.warning }, isRTL && { textAlign: 'right' }]}>{t('INVENTORY.QUANTITY')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Box size={16} color={colors.warning} />
              <TextInput 
                style={[styles.input, styles.qtyInput, { color: colors.primary }, isRTL && { textAlign: 'right' }]} 
                placeholder="00" 
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
                value={qty}
                onChangeText={setQty}
              />
              <PulseIndicator color={colors.primary} size={6} />
            </View>
          </View>
        </GlassCard>

        <TouchableOpacity style={[styles.executeBtn, { backgroundColor: colors.secondary, borderColor: colors.border, shadowColor: colors.primary }]} onPress={handleTransfer}>
          <Zap size={20} color="#fff" />
          <Text style={styles.executeText}>{t('TRANSFERS.EXECUTE')}</Text>
          <Activity size={16} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>{t('TRANSFERS.SECURE')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  headerBadge: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  stepCircle: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  stepNum: { fontSize: 12, fontWeight: '900' },
  stepLine: { width: 40, height: 2, marginHorizontal: 8 },
  content: { padding: 24, paddingBottom: 100 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  formSection: { padding: 20, marginBottom: 32 },
  inputGroup: { gap: 10 },
  label: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 16, height: 54, borderWidth: 1, gap: 12 },
  input: { flex: 1, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  qtyInput: { fontSize: 20 },
  flowDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  dashLine: { flex: 1, height: 1 },
  dividerIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scanAction: { padding: 8, borderRadius: 10 },
  executeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, borderRadius: 24, borderWidth: 1, shadowOpacity: 0.2, shadowRadius: 20 },
  executeText: { color: '#fff', fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 8, fontWeight: "800", letterSpacing: 1, opacity: 0.5 },
});
