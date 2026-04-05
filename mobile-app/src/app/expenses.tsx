import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  TextInput,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Share,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Search,
  TrendingDown,
  Filter,
  FileText,
  Trash2,
  Fingerprint,
  Layers,
  Activity,
  ShieldAlert,
  Calendar,
  ChevronRight,
  Zap,
  X,
  CreditCard,
  DollarSign,
  Check,
  User,
  Banknote,
  Cpu,
  Download,
  ExternalLink,
  ShieldCheck,
  Clock,
  History,
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import { GlassCard } from "../components/GlassCard";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  SlideInUp,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import api from "../api/client";
import { PulseIndicator } from "../components/PulseIndicator";
import { NeuralChart } from "../components/NeuralChart";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "../utils/format";
import { sqliteService } from "../services/sqlite.service";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const CATEGORIES = [
  "ALL",
  "RENT",
  "SALARY",
  "UTILITY",
  "MARKETING",
  "MAINTENANCE",
  "TAX",
  "OTHER",
];
const FORM_CATEGORIES = [
  "RENT",
  "SALARY",
  "UTILITY",
  "MARKETING",
  "MAINTENANCE",
  "TAX",
  "OTHER",
];
const PAYMENT_METHODS = ["CASH", "CHEQUE", "TRANSFER"];

export default function ExpensesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode, typography, spacing } = theme;

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal States
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    payee: "",
    category: "OTHER",
    paymentMethod: "CASH",
    status: "PAID",
  });

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await api.get("expenses");
      if (data.success) {
        setExpenses(data.data || []);
        await sqliteService.logEvent(
          "EXPENSE_SYNC",
          "SYSTEM",
          `Synced ${data.data.length} nodes`,
          "INFO",
        );
      }
    } catch (e) {
      console.error("[Expenses] Ledger Connection Compromised:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleOpenModal = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAddModalVisible(true);
  };

  const handleOpenDetail = (expense: any) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExpense(expense);
    setDetailModalVisible(true);
  };

  const handleCreateExpense = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert("VALIDATION_ERROR", "ALL_FIELDS_REQUIRED");
      return;
    }

    setIsSubmitting(true);
    try {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(),
      };

      const { data } = await api.post("expenses", payload);

      if (data.success) {
        if (Platform.OS !== "web")
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        setAddModalVisible(false);
        setFormData({
          amount: "",
          description: "",
          payee: "",
          category: "OTHER",
          paymentMethod: "CASH",
          status: "PAID",
        });
        fetchExpenses();
        await sqliteService.logEvent(
          "EXPENSE_CREATED",
          "USER",
          `New node created: ${data.data._id}`,
          "INFO",
        );
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("PROTOCOL_FAILURE", "FISCAL_INJECTION_FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("PURGE_FISCAL_SIGNAL", "CONFIRM_PERMANENT_DELETION?", [
      { text: "ABORT", style: "cancel" },
      {
        text: "PURGE",
        style: "destructive",
        onPress: async () => {
          try {
            const { data } = await api.delete(`expenses/${id}`);
            if (data.success) {
              if (Platform.OS !== "web")
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              setDetailModalVisible(false);
              fetchExpenses();
              await sqliteService.logEvent(
                "EXPENSE_PURGE",
                "USER",
                `Purged node ${id}`,
                "WARN",
              );
            }
          } catch (e) {
            Alert.alert("ERROR", "SIGNAL_PURGE_FAILED");
          }
        },
      },
    ]);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase()) ||
        e.payee?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" ||
        e.category?.toUpperCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedCategory]);

  const totalBurn = useMemo(
    () => filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    [filteredExpenses],
  );

  const avgBurn = useMemo(
    () =>
      filteredExpenses.length > 0 ? totalBurn / filteredExpenses.length : 0,
    [filteredExpenses, totalBurn],
  );

  const renderItem = ({ item, index }: any) => {
    const getCategoryColor = (cat: string) => {
      switch (cat?.toUpperCase()) {
        case "RENT":
          return colors.primary;
        case "SALARY":
          return colors.accent;
        case "UTILITY":
          return colors.warning;
        case "MARKETING":
          return "#ec4899";
        case "MAINTENANCE":
          return "#8b5cf6";
        case "TAX":
          return "#ef4444";
        default:
          return colors.textLight;
      }
    };

    const color = getCategoryColor(item.category);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 40).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleOpenDetail(item)}
        >
          <GlassCard
            style={[styles.card, { borderLeftColor: color }]}
            variant={isDarkMode ? "dark" : "light"}
          >
            <View style={styles.cardHeader}>
              <View style={styles.idSection}>
                <View
                  style={[styles.miniIcon, { backgroundColor: color + "15" }]}
                >
                  <Fingerprint size={12} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: color, ...typography.pro },
                    ]}
                  >
                    {item.category || "UNCLASSIFIED"}
                  </Text>
                  <Text
                    style={[
                      styles.description,
                      { color: colors.text, ...typography.pro },
                    ]}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                  {item.payee && (
                    <View style={styles.payeeRow}>
                      <User size={8} color={colors.textLight} opacity={0.5} />
                      <Text
                        style={[
                          styles.payeeText,
                          { color: colors.textLight, ...typography.pro },
                        ]}
                      >
                        {item.payee}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.amountBox}>
                <Text
                  style={[
                    styles.amountValue,
                    { color: colors.danger, ...typography.pro },
                  ]}
                >
                  -{formatCurrency(item.amount)}
                </Text>
                <View style={styles.paymentMethodRow}>
                  <Banknote size={8} color={colors.accent} opacity={0.6} />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      { color: colors.accent, ...typography.pro },
                    ]}
                  >
                    {item.paymentMethod || "CASH"}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Calendar size={8} color={colors.textLight} opacity={0.4} />
                  <Text
                    style={[
                      styles.dateText,
                      { color: colors.textLight, ...typography.pro },
                    ]}
                  >
                    {formatDate(item.date)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "PAID"
                        ? colors.accent + "10"
                        : colors.warning + "10",
                  },
                ]}
              >
                <PulseIndicator
                  color={
                    item.status === "PAID" ? colors.accent : colors.warning
                  }
                  size={4}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        item.status === "PAID" ? colors.accent : colors.warning,
                      ...typography.pro,
                    },
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <ChevronRight
                  size={14}
                  color={colors.textLight}
                  opacity={0.3}
                />
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* --- NEURAL HEADER ENGINE --- */}
      <View style={[styles.headerSection, { backgroundColor: "#000" }]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ArrowLeft color="#fff" size={20} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Activity size={12} color={colors.primary} />
              <Text style={[styles.headerTitle, { ...typography.pro }]}>
                LEDGER_CORE_V4.0
              </Text>
            </View>
            <TouchableOpacity onPress={handleOpenModal} style={styles.addBtn}>
              <Plus color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.burnRateEngine}>
            <View style={styles.metricsHeader}>
              <View>
                <Text
                  style={[
                    styles.metricLabel,
                    { color: "rgba(255,255,255,0.4)", ...typography.pro },
                  ]}
                >
                  TOTAL_BURN_VOLUME
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: "#fff", ...typography.pro },
                  ]}
                >
                  {formatCurrency(totalBurn)}
                </Text>
              </View>
              <View style={styles.avgBox}>
                <Text
                  style={[
                    styles.metricLabel,
                    { color: "rgba(255,255,255,0.4)", ...typography.pro },
                  ]}
                >
                  AVG_SIGNAL_VAL
                </Text>
                <Text
                  style={[
                    styles.avgValue,
                    { color: colors.accent, ...typography.pro },
                  ]}
                >
                  {formatCurrency(avgBurn)}
                </Text>
              </View>
            </View>
            <View style={styles.visualization}>
              <NeuralChart />
            </View>
          </View>

          <View style={styles.controlCenter}>
            {/* AI Signal Badge */}
            <View style={styles.aiSignalContainer}>
              <GlassCard
                variant="transparent"
                intensity={5}
                style={styles.aiBadge}
              >
                <Cpu size={10} color={colors.primary} />
                <Text
                  style={[
                    styles.aiText,
                    { color: "rgba(255,255,255,0.6)", ...typography.pro },
                  ]}
                >
                  NEURAL_INSIGHT:{" "}
                  {totalBurn > 10000
                    ? "HIGH_BURN_DETECTED"
                    : "FISCAL_STABILITY_OPTIMAL"}
                </Text>
              </GlassCard>
            </View>

            <View style={styles.searchContainer}>
              <GlassCard
                variant="transparent"
                intensity={10}
                style={styles.searchGlass}
              >
                <Search size={14} color="rgba(255,255,255,0.3)" />
                <TextInput
                  placeholder="FILTER_FISCAL_SIGNALS..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={search}
                  onChangeText={setSearch}
                  style={[
                    styles.searchInput,
                    { color: "#fff", ...typography.pro },
                  ]}
                />
                <Zap size={14} color={colors.primary} fill={colors.primary} />
              </GlassCard>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    if (Platform.OS !== "web")
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(cat);
                  }}
                  style={[
                    styles.catTab,
                    selectedCategory === cat && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catTabText,
                      {
                        color:
                          selectedCategory === cat
                            ? "#fff"
                            : "rgba(255,255,255,0.4)",
                        ...typography.pro,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      {/* --- FISCAL STREAM --- */}
      {loading ? (
        <View style={styles.center}>
          <PulseIndicator color={colors.primary} size={40} />
          <Text
            style={[
              styles.loadingText,
              { color: colors.primary, ...typography.pro },
            ]}
          >
            SCANNING_FISCAL_FLUX...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <View style={styles.headerLabelRow}>
                <Layers size={10} color={colors.textLight} />
                <Text
                  style={[
                    styles.listHeaderTitle,
                    { color: colors.textLight, ...typography.pro },
                  ]}
                >
                  ACTIVE_SIGNALS_DETECTED: {filteredExpenses.length}
                </Text>
              </View>
              <View
                style={[
                  styles.headerDivider,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <ShieldAlert size={48} color={colors.border} strokeWidth={1} />
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.textLight, ...typography.pro },
                ]}
              >
                NO_FISCAL_NODES_IDENTIFIED
              </Text>
            </View>
          }
        />
      )}

      {/* --- ADD EXPENSE MODAL (ULTRA PRO) --- */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDarkMode ? "#0f172a" : "#fff" },
              ]}
            >
              <View
                style={[styles.dragHandle, { backgroundColor: colors.border }]}
              />

              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Zap
                    size={normalize(16)}
                    color={colors.primary}
                    fill={colors.primary}
                  />
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.text, ...typography.pro },
                    ]}
                  >
                    FISCAL_INJECTION_NODE
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X color={colors.text} size={normalize(20)} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBody}
                keyboardShouldPersistTaps="handled"
              >
                {/* Quantum Amount Flex Input */}
                <Animated.View
                  layout={Layout.springify()}
                  style={styles.inputGroup}
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textLight, ...typography.pro },
                    ]}
                  >
                    QUANTUM_AMOUNT (MAD)
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                        borderColor: formData.amount
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <DollarSign
                      size={normalize(18)}
                      color={
                        formData.amount ? colors.primary : colors.textLight
                      }
                    />
                    <TextInput
                      style={[
                        styles.modalInput,
                        { color: colors.text, ...typography.pro },
                      ]}
                      placeholder="0.00"
                      placeholderTextColor={colors.textLight}
                      keyboardType="numeric"
                      value={formData.amount}
                      onChangeText={(val) =>
                        setFormData({ ...formData, amount: val })
                      }
                    />
                    {formData.amount.length > 0 && (
                      <PulseIndicator color={colors.accent} size={4} />
                    )}
                  </View>
                </Animated.View>

                {/* Payee Identity Flex Input */}
                <Animated.View
                  layout={Layout.springify()}
                  style={styles.inputGroup}
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textLight, ...typography.pro },
                    ]}
                  >
                    PAYEE_IDENTITY (PERSON)
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                        borderColor: formData.payee
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <User
                      size={normalize(18)}
                      color={formData.payee ? colors.primary : colors.textLight}
                    />
                    <TextInput
                      style={[
                        styles.modalInput,
                        { color: colors.text, ...typography.pro },
                      ]}
                      placeholder="NAME_OR_ENTITY..."
                      placeholderTextColor={colors.textLight}
                      value={formData.payee}
                      onChangeText={(val) =>
                        setFormData({ ...formData, payee: val })
                      }
                    />
                  </View>
                </Animated.View>

                {/* Signal Description Flex Input */}
                <Animated.View
                  layout={Layout.springify()}
                  style={styles.inputGroup}
                >
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textLight, ...typography.pro },
                    ]}
                  >
                    SIGNAL_DESCRIPTION
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                        borderColor: formData.description
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <FileText
                      size={normalize(18)}
                      color={
                        formData.description ? colors.primary : colors.textLight
                      }
                    />
                    <TextInput
                      style={[
                        styles.modalInput,
                        { color: colors.text, ...typography.pro },
                      ]}
                      placeholder="NODE_DESCRIPTION..."
                      placeholderTextColor={colors.textLight}
                      value={formData.description}
                      onChangeText={(val) =>
                        setFormData({ ...formData, description: val })
                      }
                    />
                  </View>
                </Animated.View>

                {/* Payment Protocol Selector */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textLight, ...typography.pro },
                    ]}
                  >
                    PAYMENT_PROTOCOL
                  </Text>
                  <View style={styles.modalCategoryGrid}>
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = formData.paymentMethod === method;
                      return (
                        <TouchableOpacity
                          key={method}
                          onPress={() => {
                            if (Platform.OS !== "web")
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                              );
                            setFormData({ ...formData, paymentMethod: method });
                          }}
                        >
                          <Animated.View
                            layout={Layout.springify()}
                            style={[
                              styles.modalCatItem,
                              {
                                backgroundColor: isSelected
                                  ? colors.accent + "20"
                                  : isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.03)",
                                borderColor: isSelected
                                  ? colors.accent
                                  : colors.border,
                                transform: [{ scale: isSelected ? 1.05 : 1 }],
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.modalCatText,
                                {
                                  color: isSelected
                                    ? colors.accent
                                    : colors.textLight,
                                  ...typography.pro,
                                },
                              ]}
                            >
                              {method}
                            </Text>
                          </Animated.View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Registry Category Spring Grid */}
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textLight, ...typography.pro },
                    ]}
                  >
                    REGISTRY_CATEGORY
                  </Text>
                  <View style={styles.modalCategoryGrid}>
                    {FORM_CATEGORIES.map((cat) => {
                      const isSelected = formData.category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => {
                            if (Platform.OS !== "web")
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                              );
                            setFormData({ ...formData, category: cat });
                          }}
                        >
                          <Animated.View
                            layout={Layout.springify()}
                            style={[
                              styles.modalCatItem,
                              {
                                backgroundColor: isSelected
                                  ? colors.primary + "20"
                                  : isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.03)",
                                borderColor: isSelected
                                  ? colors.primary
                                  : colors.border,
                                transform: [{ scale: isSelected ? 1.05 : 1 }],
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.modalCatText,
                                {
                                  color: isSelected
                                    ? colors.primary
                                    : colors.textLight,
                                  ...typography.pro,
                                },
                              ]}
                            >
                              {cat}
                            </Text>
                            {isSelected && (
                              <Animated.View
                                entering={FadeInRight}
                                style={{ marginLeft: 6 }}
                              >
                                <Check
                                  size={10}
                                  color={colors.primary}
                                  strokeWidth={4}
                                />
                              </Animated.View>
                            )}
                          </Animated.View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCreateExpense}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    layout={Layout.springify()}
                    style={[
                      styles.submitBtn,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Zap size={normalize(20)} color="#fff" fill="#fff" />
                        <Text
                          style={[styles.submitText, { ...typography.pro }]}
                        >
                          EXECUTE_SIGNAL
                        </Text>
                      </>
                    )}
                  </Animated.View>
                </TouchableOpacity>
                <View style={{ height: normalize(40) }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* --- FORENSIC DETAIL MODAL (ULTRA PRO) --- */}
      <Modal
        visible={isDetailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setDetailModalVisible(false)}
          />
          <Animated.View entering={FadeInDown} style={styles.detailContainer}>
            <GlassCard
              variant={isDarkMode ? "dark" : "light"}
              style={styles.detailGlass}
              intensity={60}
            >
              <View style={styles.detailHeader}>
                <View style={styles.detailType}>
                  <ShieldCheck size={16} color={colors.accent} />
                  <Text
                    style={[
                      styles.detailTypeText,
                      { color: colors.accent, ...typography.pro },
                    ]}
                  >
                    VERIFIED_SIGNAL
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X color={colors.text} size={20} />
                </TouchableOpacity>
              </View>

              {selectedExpense && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.detailHero}>
                    <Text
                      style={[
                        styles.detailAmount,
                        { color: colors.danger, ...typography.pro },
                      ]}
                    >
                      -{formatCurrency(selectedExpense.amount)}
                    </Text>
                    <View style={styles.detailCategoryBadge}>
                      <Text
                        style={[
                          styles.detailCatText,
                          { color: colors.primary, ...typography.pro },
                        ]}
                      >
                        {selectedExpense.category}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRegistry}>
                    <DetailItem
                      label="SIGNAL_ID"
                      value={selectedExpense._id}
                      icon={<Fingerprint size={12} color={colors.textLight} />}
                    />
                    <DetailItem
                      label="PAYEE_ENTITY"
                      value={selectedExpense.payee || "ANONYMOUS"}
                      icon={<User size={12} color={colors.textLight} />}
                    />
                    <DetailItem
                      label="DESCRIPTION"
                      value={selectedExpense.description}
                      icon={<FileText size={12} color={colors.textLight} />}
                    />
                    <DetailItem
                      label="PROTOCOL"
                      value={selectedExpense.paymentMethod || "CASH"}
                      icon={<Banknote size={12} color={colors.textLight} />}
                    />
                    <DetailItem
                      label="TIMESTAMP"
                      value={formatDate(selectedExpense.date)}
                      icon={<Clock size={12} color={colors.textLight} />}
                    />
                    <DetailItem
                      label="STATUS"
                      value={selectedExpense.status}
                      icon={<PulseIndicator color={colors.accent} size={4} />}
                    />
                  </View>

                  <View style={styles.detailActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionGridBtn,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.03)",
                        },
                      ]}
                      onPress={() =>
                        Share.share({
                          message: `Expense Signal: ${selectedExpense.description} - ${formatCurrency(selectedExpense.amount)}`,
                        })
                      }
                    >
                      <ExternalLink size={18} color={colors.primary} />
                      <Text
                        style={[
                          styles.actionGridText,
                          { color: colors.text, ...typography.pro },
                        ]}
                      >
                        EXPORT_SIGNAL
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionGridBtn,
                        { backgroundColor: colors.danger + "15" },
                      ]}
                      onPress={() => handleDelete(selectedExpense._id)}
                    >
                      <Trash2 size={18} color={colors.danger} />
                      <Text
                        style={[
                          styles.actionGridText,
                          { color: colors.danger, ...typography.pro },
                        ]}
                      >
                        PURGE_NODE
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ height: 20 }} />
                </ScrollView>
              )}
            </GlassCard>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function DetailItem({ label, value, icon }: any) {
  const theme = useAppTheme();
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailItemLabelRow}>
        {icon}
        <Text
          style={[
            styles.detailItemLabel,
            { color: theme.colors.textLight, ...theme.typography.pro },
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.detailItemValue,
          { color: theme.colors.text, ...theme.typography.pro },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 10, letterSpacing: 2 },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  burnRateEngine: { paddingHorizontal: 20, marginBottom: 10 },
  metricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  metricLabel: { fontSize: 7, letterSpacing: 1.5 },
  metricValue: { fontSize: 28, marginTop: 4, letterSpacing: -1 },
  avgBox: { alignItems: "flex-end" },
  avgValue: { fontSize: 14, marginTop: 4 },
  visualization: { height: 60, marginTop: 10 },

  controlCenter: { paddingBottom: 20 },
  aiSignalContainer: { paddingHorizontal: 20, marginBottom: 12 },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: normalize(10),
  },
  aiText: { fontSize: 7, letterSpacing: 1 },

  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchGlass: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 14,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 9, letterSpacing: 1 },

  categoryScroll: { paddingHorizontal: 20, gap: 10 },
  catTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  catTabText: { fontSize: 8, letterSpacing: 1 },

  list: { padding: 20, paddingBottom: 100 },
  listHeader: { marginBottom: 20 },
  headerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  listHeaderTitle: { fontSize: 8, letterSpacing: 1, opacity: 0.6 },
  headerDivider: { height: 1, width: "100%" },

  card: { marginBottom: 16, borderRadius: 20, borderLeftWidth: 3, padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  idSection: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  miniIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 6,
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 2,
  },
  description: { fontSize: 13, letterSpacing: 0.5 },
  payeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  payeeText: { fontSize: 8, opacity: 0.6 },
  amountBox: { alignItems: "flex-end" },
  amountValue: { fontSize: 16, letterSpacing: -0.5 },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  paymentMethodText: { fontSize: 7, fontWeight: "900" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dateText: { fontSize: 7, opacity: 0.4 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 7, letterSpacing: 0.5 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 12 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 20, fontSize: 9, letterSpacing: 2 },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: { marginTop: 20, fontSize: 9, letterSpacing: 2, opacity: 0.5 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "transparent",
  },
  modalGlass: {
    padding: normalize(24),
    paddingBottom: normalize(60),
    borderTopLeftRadius: normalize(32),
    borderTopRightRadius: normalize(32),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dragHandle: {
    width: normalize(40),
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: normalize(20),
    opacity: 0.2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(24),
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: normalize(12),
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  modalBody: {
    gap: normalize(20),
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: normalize(8),
    letterSpacing: 1,
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: normalize(54),
    borderRadius: normalize(16),
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  modalInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: normalize(14),
    letterSpacing: 0.5,
  },
  modalCategoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalCatItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  modalCatText: {
    fontSize: normalize(9),
    letterSpacing: 0.5,
  },
  submitBtn: {
    height: normalize(60),
    borderRadius: normalize(20),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: normalize(10),
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: normalize(14),
    letterSpacing: 2,
  },

  // Detail Modal Styles
  detailContainer: {
    width: "100%",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  detailGlass: {
    width: "100%",
    borderRadius: 32,
    padding: 24,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  detailType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailTypeText: {
    fontSize: 8,
    letterSpacing: 1,
  },
  detailHero: {
    alignItems: "center",
    marginBottom: 40,
  },
  detailAmount: {
    fontSize: 42,
    letterSpacing: -2,
  },
  detailCategoryBadge: {
    marginTop: 10,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: normalize(20),
  },
  detailCatText: {
    fontSize: 10,
    letterSpacing: 2,
  },
  detailRegistry: {
    gap: 24,
    marginBottom: 40,
  },
  detailItem: {
    gap: 6,
  },
  detailItemLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.5,
  },
  detailItemLabel: {
    fontSize: 7,
    letterSpacing: 1,
  },
  detailItemValue: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  detailActions: {
    flexDirection: "row",
    gap: 15,
  },
  actionGridBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionGridText: {
    fontSize: 8,
    letterSpacing: 1,
  },
});
