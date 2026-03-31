import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Box, Tag, AlertTriangle, CheckCircle, Barcode, Trash2 } from "lucide-react-native";
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import api from "../api/client";
import { useAppTheme } from "../theme";
import { HapticSlider } from "../components/HapticSlider";
import { GlassCard } from "../components/GlassCard";
import { formatCurrency } from "../utils/format";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

export default function ProductDetailsPage() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollY = useSharedValue(0);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`products/${id}`);
      if (data.success) {
        setProduct(data.data);
      } else {
        const list = await api.get('products');
        const found = list.data.data.find((p: any) => p._id === id || p.sku === id);
        setProduct(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (newQty: number) => {
    if (!product) return;
    try {
      setProduct({ ...product, quantity: newQty });
      await api.put(`products/${product._id}`, { quantity: newQty });
    } catch (e) {
      console.error("Stock update failed", e);
    }
  };

  const handleDelete = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    router.back();
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, IMG_HEIGHT], [IMG_HEIGHT, 100], Extrapolate.CLAMP),
    opacity: interpolate(scrollY.value, [0, IMG_HEIGHT / 2], [1, 0]),
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolate.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, IMG_HEIGHT], [0, IMG_HEIGHT / 2], Extrapolate.CLAMP) }
    ]
  }));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.primary }]}>{t("COMMON.LOADING")}</Text>
      </View>
    );
  }

  if (!product) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.loadingText, { color: colors.textLight }]}>{t("INVENTORY.EMPTY")}</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: colors.primary }}>{t("COMMON.BACK")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.imageContainer, headerStyle]}>
        {product.image ? (
          <Animated.Image source={{ uri: product.image }} style={[styles.image, imageStyle]} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholderImg, { backgroundColor: colors.surface }]}>
            <Box size={64} color={colors.textLight} opacity={0.2} />
          </View>
        )}
        <View style={styles.overlay} />
      </Animated.View>

      <View style={[styles.navBar, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.glass }]}>
          <ArrowLeft color="#fff" size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("DETAILS.TITLE")}</Text>
        <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: colors.danger + '20' }]}>
          <Trash2 color={colors.danger} size={20} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: IMG_HEIGHT - 40, paddingBottom: 100 }}
      >
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.titleSection}>
            <View style={[styles.badgeRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '10' }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Tag size={10} color={colors.primary} />
                <Text style={[styles.categoryText, { color: colors.primary }]}>{typeof product.category === 'object' ? product.category?.name : product.category}</Text>
              </View>
              {product.quantity < 10 && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.danger }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <AlertTriangle size={10} color="#fff" />
                  <Text style={[styles.categoryText, { color: '#fff' }]}>{t('COMMON.CRITICAL_LOW')}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.productName, { color: colors.text }, isRTL && { textAlign: 'right' }]}>{product.name}</Text>
            <View style={[styles.skuRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Barcode size={14} color={colors.textLight} />
              <Text style={[styles.skuText, { color: colors.textLight }]}>{product.sku}</Text>
            </View>
          </View>

          <View style={[styles.grid, isRTL && { flexDirection: 'row-reverse' }]}>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("DETAILS.VALUATION")}</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(product.price)}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("DETAILS.STATUS")}</Text>
              <View style={[styles.statusRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <CheckCircle size={14} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text, fontSize: 14 }]}>{t('COMMON.ACTIVE')}</Text>
              </View>
            </GlassCard>
          </View>

          <View style={styles.controlSection}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t("DETAILS.ENGINE")}</Text>
            <GlassCard style={styles.controlCard} variant={isDarkMode ? "dark" : "light"}>
              <HapticSlider 
                initialValue={product.quantity} 
                onValueChange={handleStockUpdate} 
              />
            </GlassCard>
          </View>

          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }, isRTL && { textAlign: 'right' }]}>{t("DETAILS.SPECS")}</Text>
            <Text style={[styles.description, { color: colors.text }, isRTL && { textAlign: 'right' }]}>
              {product.description || t('DETAILS.NO_SPECS')}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontWeight: "900", letterSpacing: 2 },
  imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 },
  image: { width: '100%', height: '100%' },
  placeholderImg: { justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  navTitle: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  content: { borderTopLeftRadius: 40, borderTopRightRadius: 40, minHeight: 800, padding: 24, paddingBottom: 120 },
  titleSection: { marginBottom: 30 },
  badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  categoryText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  productName: { fontSize: 28, fontWeight: '900', marginBottom: 8, textTransform: 'uppercase' },
  skuRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skuText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  grid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  statLabel: { fontSize: 10, fontWeight: '900', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  controlSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '900', marginBottom: 15, letterSpacing: 1 },
  controlCard: { paddingVertical: 10 },
  detailsSection: { marginBottom: 30 },
  description: { fontSize: 14, lineHeight: 24, fontWeight: '500' }
});
