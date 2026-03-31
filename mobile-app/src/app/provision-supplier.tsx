import React, { useState, useEffect } from "react";
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
  FlatList,
  Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck,
  Zap,
  Hash,
  FileText,
  BarChart3
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import api from "../api/client";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";

const { width } = Dimensions.get('window');

export default function ProvisionSupplierPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const { id, name } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reference, setReference] = useState(`REQ_${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState("");

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('products');
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (e) {
      console.error("[Provision] Asset Registry Connection Compromised:", e);
    }
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: "", quantity: 1, purchasePrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const updateItem = (index: number, key: string, value: any) => {
    const newItems = [...selectedItems];
    newItems[index][key] = value;
    setSelectedItems(newItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
  };

  const handleFinalize = async () => {
    if (selectedItems.length === 0 || !reference) {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplierId: id,
        items: selectedItems,
        totalAmount: calculateTotal(),
        reference,
        notes,
        status: "RECEIVED"
      };

      const { data } = await api.post('purchases', payload);
      if (data.success) {
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.back();
      }
    } catch (e) {
      console.error("[Provision] Requisition Finalization Failure:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <ArrowLeft color={colors.text} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('SUPPLIERS.REQUISITION')}</Text>
          <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
            <ShieldCheck color={colors.primary} size={18} />
          </View>
        </View>

        <View style={[styles.supplierNode, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.nodeIcon, { backgroundColor: colors.secondary + '15' }]}>
            <Truck size={20} color={colors.secondary} />
          </View>
          <View style={[styles.nodeContent, isRTL && { alignItems: 'flex-end', marginRight: 12, marginLeft: 0 }]}>
            <Text style={[styles.nodeLabel, { color: colors.textLight }]}>{t('SUPPLIERS.TARGET')}</Text>
            <Text style={[styles.nodeValue, { color: colors.text }]}>{name}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* REQUISITION REFERENCE */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('SUPPLIERS.REF')}</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Hash size={16} color={colors.primary} />
                <TextInput 
                  style={[styles.input, { color: colors.text }, isRTL && { textAlign: 'right', marginRight: 10, marginLeft: 0 }]}
                  value={reference}
                  onChangeText={setReference}
                  placeholder={t('SUPPLIERS.REF_PLACEHOLDER')}
                  placeholderTextColor={colors.textLight + '80'}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ASSET MANIFEST */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
          <View style={[styles.sectionHdr, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{t('ORDERS.MANIFEST')}</Text>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={addItem}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {selectedItems.map((item, index) => (
            <GlassCard key={index} style={[styles.itemCard, { marginTop: 12 }]}>
              <View style={[styles.itemHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.itemIdx, { backgroundColor: colors.border }]}>
                  <Text style={[styles.idxText, { color: colors.textLight }]}>{index + 1}</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.itemBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>ASSET_NODE</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {products.map((p) => (
                      <TouchableOpacity 
                        key={p._id}
                        onPress={() => updateItem(index, 'productId', p._id)}
                        style={[
                          styles.productSelector, 
                          { borderColor: item.productId === p._id ? colors.primary : colors.border, backgroundColor: item.productId === p._id ? colors.primary + '10' : 'transparent' }
                        ]}
                      >
                        <Text style={[styles.pName, { color: item.productId === p._id ? colors.primary : colors.text }]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={[styles.qtyPriceRow, { marginTop: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t('INVENTORY.QUANTITY')}</Text>
                    <TextInput 
                      style={[styles.smallInput, { color: colors.text, borderColor: colors.border }, isRTL && { textAlign: 'right' }]}
                      keyboardType="numeric"
                      value={item.quantity.toString()}
                      onChangeText={(v) => updateItem(index, 'quantity', parseInt(v) || 0)}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[styles.inputLabel, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>UNIT_COST</Text>
                    <TextInput 
                      style={[styles.smallInput, { color: colors.text, borderColor: colors.border }, isRTL && { textAlign: 'right' }]}
                      keyboardType="numeric"
                      value={item.purchasePrice.toString()}
                      onChangeText={(v) => updateItem(index, 'purchasePrice', parseFloat(v) || 0)}
                    />
                  </View>
                </View>
              </View>
            </GlassCard>
          ))}

          {selectedItems.length === 0 && (
            <TouchableOpacity style={[styles.emptyState, { borderColor: colors.border, borderStyle: 'dashed' }]} onPress={addItem}>
              <Package size={32} color={colors.textLight} opacity={0.3} />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>{t('SUPPLIERS.AWAITING_INPUT')}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* LOGS & NOTES */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textLight, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>{t('SYNC.LOGS')}</Text>
          <GlassCard style={{ padding: 20 }}>
            <View style={[styles.inputGroup, isRTL && { alignItems: 'flex-end' }]}>
              <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 12, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                <FileText size={16} color={colors.warning} />
                <TextInput 
                  style={[styles.input, { color: colors.text, height: '100%' }, isRTL && { textAlign: 'right', marginRight: 10, marginLeft: 0 }]}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('SUPPLIERS.NOTES_PLACEHOLDER')}
                  placeholderTextColor={colors.textLight + '80'}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* VALUATION SUMMARY */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 24, marginBottom: 120 }}>
          <GlassCard style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <View style={[styles.totalRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View>
                <Text style={styles.totalLabel}>{t('SUPPLIERS.TOTAL_VALUATION')}</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
              </View>
              <BarChart3 size={32} color="rgba(255,255,255,0.3)" />
            </View>
          </GlassCard>

          <TouchableOpacity 
            style={[styles.finalizeBtn, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]}
            onPress={handleFinalize}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={20} color="#fff" />
                <Text style={styles.finalizeText}>{t('SUPPLIERS.FINALIZE')}</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
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
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  backBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  headerTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 2, fontStyle: "italic", textTransform: "uppercase" },
  badge: { padding: 10, borderRadius: 14 },
  supplierNode: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', padding: 16, borderRadius: 16 },
  nodeIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  nodeContent: { marginLeft: 16 },
  nodeLabel: { fontSize: 7, fontWeight: "900", letterSpacing: 1 },
  nodeValue: { fontSize: 16, fontWeight: "900", fontStyle: "italic" },
  scrollContent: { padding: 24 },
  formCard: { padding: 20 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  addBtn: { padding: 8, borderRadius: 10 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 },
  input: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "700" },
  itemCard: { padding: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  itemIdx: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  idxText: { fontSize: 10, fontWeight: "900" },
  productSelector: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 8 },
  pName: { fontSize: 11, fontWeight: "800" },
  qtyPriceRow: { flexDirection: 'row' },
  smallInput: { height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, fontWeight: "700", marginTop: 8 },
  emptyState: { height: 120, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  totalCard: { padding: 24, marginTop: 32 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  totalValue: { color: '#fff', fontSize: 28, fontWeight: "900", fontStyle: "italic", marginTop: 4 },
  finalizeBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16, shadowOpacity: 0.3, shadowRadius: 15 },
  finalizeText: { color: '#fff', fontSize: 12, fontWeight: "900", letterSpacing: 2, fontStyle: "italic" }
});
