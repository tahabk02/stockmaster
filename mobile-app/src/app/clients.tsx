import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Search, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Building2,
  ChevronRight,
  Trash2
} from "lucide-react-native";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import clientService, { Client } from "../services/client.service";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";

export default function ClientsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const isRTL = i18n.language === 'ar';

  const fetchClients = useCallback(async (query?: string) => {
    try {
      const data = await clientService.getClients(query);
      if (data.clients) {
        setClients(data.clients);
      }
    } catch (e) {
      console.error("[Clients] Registry Connection Compromised:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients(search);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchClients(text);
    }, 500);
  };

  const handleContact = async (type: 'phone' | 'email', value?: string) => {
    if (!value) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = type === 'phone' ? `tel:${value}` : `mailto:${value}`;
    Linking.openURL(url);
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      t('COMMON.DELETE'),
      `${t('CLIENTS.DELETE_CONFIRM')} ${name}?`,
      [
        { text: t('COMMON.CANCEL'), style: 'cancel' },
        { 
          text: t('COMMON.DELETE'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await clientService.deleteClient(id);
              if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setClients(prev => prev.filter(c => c._id !== id));
            } catch (e) {
              Alert.alert("Error", "Could not purge client from registry.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Client, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => router.push({ pathname: "/client-details", params: { id: item._id } })}
      >
        <GlassCard style={[styles.card, { borderLeftColor: item.type === 'COMPANY' ? colors.primary : colors.accent }]} variant={isDarkMode ? "dark" : "light"}>
          <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.nameContainer, isRTL && { alignItems: 'flex-end' }]}>
              <View style={[styles.titleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {item.type === 'COMPANY' ? <Building2 size={16} color={colors.primary} /> : <User size={16} color={colors.accent} />}
                <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
                <PulseIndicator color={item.status === 'ACTIVE' ? colors.accent : colors.danger} size={6} />
              </View>
              <Text style={[styles.clientSub, { color: colors.textLight }]}>{item.type || "INDIVIDUAL"}</Text>
            </View>
            <View style={[styles.debtBox, isRTL && { alignItems: 'flex-start' }]}>
              <Text style={[styles.debtLabel, { color: colors.textLight }]}>{t('CLIENTS.EXPOSURE')}</Text>
              <Text style={[styles.debtValue, { color: (item.totalDebt || 0) > 0 ? colors.danger : colors.accent }]}>
                {formatCurrency(item.totalDebt || 0)}
              </Text>
            </View>
          </View>

          <View style={[styles.contactGrid, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={[styles.contactNode, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]} 
              onPress={() => handleContact('phone', item.phone)}
            >
              <Phone size={12} color={colors.primary} />
              <Text style={[styles.nodeValue, { color: colors.text }]} numberOfLines={1}>{item.phone || "N/A"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactNode, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
              onPress={() => handleContact('email', item.email)}
            >
              <Mail size={12} color={colors.accent} />
              <Text style={[styles.nodeValue, { color: colors.text }]} numberOfLines={1}>{item.email || "N/A"}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.cardFooter, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.loyaltyBadge, { backgroundColor: colors.warning + '15' }]}>
              <Zap size={10} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.loyaltyText, { color: colors.warning }]}>{item.loyaltyPoints || 0} PTS</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => handleDelete(item._id!, item.name)}>
                    <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
                <ChevronRight size={16} color={colors.textLight} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('CLIENTS.TITLE')}</Text>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={async () => {
              if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/add-client");
            }}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
          <Search size={18} color={colors.textLight} />
          <TextInput
            placeholder={t('CLIENTS.FILTER')}
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={handleSearch}
            style={[styles.searchInput, { color: colors.text }, isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }]}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <PulseIndicator color={colors.primary} size={40} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>{t("COMMON.LOADING")}</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderItem}
          keyExtractor={(item) => item._id!}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <User size={64} color={colors.border} strokeWidth={1} />
              <Text style={[styles.emptyText, { color: colors.text }]}>{t('CLIENTS.NO_CLIENTS')}</Text>
            </View>
          }
        />
      )}
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
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  addBtn: { padding: 10, borderRadius: 14, shadowOpacity: 0.3, shadowRadius: 10 },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    borderRadius: 16, 
    height: 54,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 12, fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  list: { padding: 24, paddingBottom: 120 },
  card: { marginBottom: 20, padding: 20, borderLeftWidth: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  nameContainer: { gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  clientName: { fontSize: 16, fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" },
  clientSub: { fontSize: 8, fontWeight: "900", textTransform: "uppercase", opacity: 0.6 },
  debtBox: { alignItems: "flex-end" },
  debtLabel: { fontSize: 7, fontWeight: "900", marginBottom: 2 },
  debtValue: { fontSize: 14, fontWeight: "900", fontStyle: "italic" },
  contactGrid: { flexDirection: "row", gap: 8, marginBottom: 16 },
  contactNode: { flex: 1, padding: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1 },
  nodeValue: { fontSize: 9, fontWeight: "800", flex: 1 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  loyaltyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  loyaltyText: { fontSize: 9, fontWeight: "900" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 24, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  emptyCenter: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 24, fontSize: 14, fontWeight: "900", letterSpacing: 2 },
});
