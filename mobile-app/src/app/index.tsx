import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  FlatList,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
} from "react-native-reanimated";
import {
  Zap,
  Package,
  Truck,
  Receipt,
  BarChart3,
  Shield,
  Activity,
  Cpu,
  ArrowRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useAppTheme, normalize } from "../theme";
import { PulseIndicator } from "../components/PulseIndicator";
import { ImageDetailModal } from "../components/ImageDetailModal";

const SLIDER_IMAGES = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200",
    title: "LOGISTICS_HUB",
    code: "0x82A_ALPHA",
    desc: "TERMINAL DE DISTRIBUTION AUTOMATISÉ v4.2",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
    title: "NEURAL_CORE",
    code: "LATTICE_SYNC",
    desc: "ARCHITECTURE PROCESSEUR TEMPS-RÉEL",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
    title: "GLOBAL_DATA",
    code: "PLANETARY_MESH",
    desc: "RÉSEAU DE SYNCHRONISATION PLANÉTAIRE",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
    title: "CYBER_AXIS",
    code: "JWT_ISOLATION",
    desc: "PROTOCOLE DE SÉCURITÉ MILITAIRE",
  },
];

const SlideItem = ({ item, isActive, openAsset, width, height }: any) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.slide, { width, height: height * 0.7 }]}
      onPress={() =>
        openAsset({
          image: item.url,
          title: item.title,
          subtitle: item.desc,
          details: [
            "Signal Alpha Detecté",
            "Lattice v4 Sync",
            "Forensic Data Active",
          ],
          tags: ["CORE", "PRO"],
        })
      }
    >
      <Image source={{ uri: item.url }} style={styles.slideImage} />
      <LinearGradient
        colors={[
          "rgba(6, 6, 15, 0.2)",
          "rgba(6, 6, 15, 0.6)",
          "rgba(6, 6, 15, 1)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.slideContent}>
        {isActive && (
          <Animated.View entering={FadeInDown.duration(800).delay(300)}>
            <View style={styles.slideCodeRow}>
              <View
                style={[styles.codeBadge, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.codeText}>{item.code}</Text>
              </View>
              <View style={styles.codeLine} />
            </View>
            <Text style={[styles.slideTitle, { fontSize: normalize(36) }]}>
              {item.title}
            </Text>
            <Animated.Text
              entering={FadeInRight.duration(800).delay(500)}
              style={styles.slideDesc}
            >
              {item.desc}
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const FeatureCard = ({
  num,
  title,
  subtitle,
  icon: Icon,
  image,
  onPress,
  cardWidth,
}: any) => {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.featureCard,
        { width: cardWidth, borderColor: "rgba(255,255,255,0.05)" },
      ]}
    >
      <Image source={{ uri: image }} style={styles.featureImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featureContent}>
        <Text style={styles.featureNum}>{num}</Text>
        <View style={styles.featureIconWrapper}>
          <Icon size={normalize(18)} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.featureTitle,
            { color: "#fff", fontSize: normalize(14) },
          ]}
        >
          {title}
        </Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function LandingPage() {
  const { colors, isDarkMode } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const openAsset = (asset: any) => {
    setSelectedAsset(asset);
    setModalVisible(true);
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleNavigate = (path: any) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % SLIDER_IMAGES.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const numColumns = width > 600 ? 3 : 2;
  const cardWidth =
    (width - normalize(60) - (numColumns - 1) * normalize(15)) / numColumns;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#06060F" : colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* FIXED PRO NAV */}
      <View style={styles.fixedNav}>
        <View style={styles.navLogo}>
          <Zap size={20} color={colors.primary} />
          <Text style={styles.navLogoText}>
            STOCKMASTER <Text style={{ color: colors.primary }}>PRO.</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.navDeployBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleNavigate("/login")}
        >
          <Text style={styles.navDeployText}>DÉPLOYER ↗</Text>
        </TouchableOpacity>
      </View>

      <ImageDetailModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        {...selectedAsset}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. HERO SLIDER */}
        <View style={[styles.heroSection, { height: height * 0.7 }]}>
          <FlatList
            ref={flatListRef}
            data={SLIDER_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SlideItem
                item={item}
                isActive={index === activeIndex}
                openAsset={openAsset}
                width={width}
                height={height}
              />
            )}
          />

          <SafeAreaView style={styles.heroOverlay} pointerEvents="box-none">
            <Animated.View
              entering={FadeInUp.duration(1000)}
              style={styles.heroContent}
              pointerEvents="box-none"
            >
              <View style={styles.topHUD}>
                <View style={styles.proBadge}>
                  <Activity size={normalize(10)} color={colors.primary} />
                  <Text
                    style={[styles.proBadgeText, { fontSize: normalize(7) }]}
                  >
                    OS_CORE_ACTIVE
                  </Text>
                </View>
                <View style={styles.pagination}>
                  {SLIDER_IMAGES.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            i === activeIndex
                              ? colors.primary
                              : "rgba(255,255,255,0.2)",
                          width:
                            i === activeIndex ? normalize(16) : normalize(4),
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.heroTextGroup}>
                <Text
                  style={[styles.heroTitleSmall, { fontSize: normalize(10) }]}
                >
                  COMMAND_CENTER
                </Text>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <ArrowRight size={normalize(16)} color="#fff" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* 2. TELEMETRY BAR */}
        <View style={styles.telemetryBar}>
          <View style={styles.telemetryHeader}>
            <Cpu size={normalize(12)} color={colors.primary} />
            <Text style={[styles.telemetryLabel, { fontSize: normalize(8) }]}>
              SYSTEM_TELEMETRY
            </Text>
            <View style={styles.spacer} />
            <PulseIndicator color={colors.primary} size={normalize(4)} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.statsScroll,
              { paddingHorizontal: normalize(30) },
            ]}
          >
            {[
              {
                l: "ASSETS",
                v: "50K+",
                d: "STABLE",
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400",
              },
              {
                l: "UPTIME",
                v: "99.9%",
                d: "ACTIVE",
                img: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=400",
              },
              {
                l: "NODES",
                v: "840+",
                d: "OPTIMAL",
                img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400",
              },
            ].map((stat, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.statItem, { width: normalize(110) }]}
                onPress={() =>
                  openAsset({
                    image: stat.img,
                    title: stat.l,
                    subtitle: stat.v,
                  })
                }
              >
                <Text style={[styles.statLabel, { fontSize: normalize(7) }]}>
                  {stat.l}
                </Text>
                <Text style={[styles.statValue, { fontSize: normalize(16) }]}>
                  {stat.v}
                </Text>
                <Text
                  style={[
                    styles.statDelta,
                    { color: colors.primary, fontSize: normalize(7) },
                  ]}
                >
                  {stat.d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. CORE MODULES */}
        <View style={[styles.section, { padding: normalize(30) }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { fontSize: normalize(8) }]}>
              // PROTOCOL_MODULES
            </Text>
            <Text style={[styles.sectionTitle, { fontSize: normalize(28) }]}>
              CORE <Text style={{ color: colors.primary }}>ARCHITECTURE.</Text>
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <FeatureCard
              num="01"
              title="STOCKS"
              subtitle="Matrice d'inventaire."
              icon={Package}
              image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600"
              onPress={() =>
                openAsset({
                  image:
                    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800",
                  title: "STOCKS",
                  subtitle: "v4.2 Active",
                })
              }
              cardWidth={cardWidth}
            />
            <FeatureCard
              num="02"
              title="CRM"
              subtitle="Réseau partenaires."
              icon={Truck}
              image="https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=600"
              onPress={() =>
                openAsset({
                  image:
                    "https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=800",
                  title: "CRM",
                  subtitle: "Secured",
                })
              }
              cardWidth={cardWidth}
            />
            <FeatureCard
              num="03"
              title="FINANCE"
              subtitle="Automatisation flux."
              icon={Receipt}
              image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600"
              onPress={() =>
                openAsset({
                  image:
                    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800",
                  title: "FINANCE",
                  subtitle: "Automatic",
                })
              }
              cardWidth={cardWidth}
            />
            <FeatureCard
              num="04"
              title="ANALYTICS"
              subtitle="Vision prédictive."
              icon={BarChart3}
              image="https://images.unsplash.com/photo-1551288049-bbda4865cda1?q=80&w=600"
              onPress={() =>
                openAsset({
                  image:
                    "https://images.unsplash.com/photo-1551288049-bbda4865cda1?q=80&w=800",
                  title: "ANALYTICS",
                  subtitle: "Predictive",
                })
              }
              cardWidth={cardWidth}
            />
          </View>
        </View>

        {/* 4. SECURITY BLOCK */}
        <View
          style={[
            styles.securitySection,
            { padding: normalize(40), margin: normalize(30) },
          ]}
        >
          <Shield
            size={normalize(40)}
            color={colors.primary}
            style={{ marginBottom: normalize(20) }}
          />
          <Text style={[styles.securityTitle, { fontSize: normalize(24) }]}>
            SECURITY <Text style={{ color: colors.primary }}>JWT.</Text>
          </Text>
          <Text style={[styles.securityDesc, { fontSize: normalize(9) }]}>
            ISOLATION DES LOCATAIRES ET CHIFFREMENT DE NIVEAU MILITAIRE AES-256.
          </Text>
          <TouchableOpacity
            style={[
              styles.securityBtn,
              { borderColor: colors.primary, padding: normalize(15) },
            ]}
            onPress={() => handleNavigate("/login")}
          >
            <Text
              style={[
                styles.securityBtnText,
                { color: colors.primary, fontSize: normalize(9) },
              ]}
            >
              ACCÉDER AU PROTOCOLE ↗
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: normalize(120) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 0 },
  spacer: { flex: 1 },

  // FIXED NAV
  fixedNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 80,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "rgba(6, 6, 15, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  navLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  navLogoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.5,
    fontStyle: "italic",
  },
  navDeployBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  navDeployText: { color: "#fff", fontSize: 10, fontWeight: "900" },

  // SLIDER
  heroSection: { width: "100%" },
  slide: { height: "100%" },
  slideImage: { ...StyleSheet.absoluteFillObject },
  slideContent: { position: "absolute", bottom: 140, left: 30, right: 30 },
  slideCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  codeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  codeLine: { height: 1, flex: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  slideTitle: {
    fontWeight: "900",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: -1,
  },
  slideDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 5,
  },

  // OVERLAY
  heroOverlay: { flex: 1, justifyContent: "flex-end", padding: 30 },
  heroContent: { marginBottom: 20 },
  topHUD: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  proBadgeText: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "900",
    letterSpacing: 1,
  },
  pagination: { flexDirection: "row", gap: 4 },
  dot: { height: 4, borderRadius: 2 },

  heroTextGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitleSmall: {
    fontWeight: "900",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 2,
  },
  heroActions: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(14),
    borderRadius: normalize(12),
    minWidth: normalize(140),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
  },
  secondaryBtn: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  // TELEMETRY
  telemetryBar: {
    paddingVertical: 20,
    backgroundColor: "#080812",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  telemetryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  telemetryLabel: { color: "#6366f1", fontWeight: "900", letterSpacing: 2 },
  statsScroll: { gap: 15 },
  statItem: {
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#6366f1",
  },
  statLabel: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: "900",
    marginBottom: 4,
  },
  statValue: { fontWeight: "900", color: "#fff" },
  statDelta: { fontWeight: "900", marginTop: 4 },

  // FEATURES
  section: { width: "100%" },
  sectionHeader: { marginBottom: 25 },
  sectionLabel: {
    color: "#6366f1",
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#fff",
  },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15 },
  featureCard: {
    height: normalize(180),
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  featureImage: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  featureContent: { flex: 1, padding: 15, justifyContent: "flex-end" },
  featureNum: {
    position: "absolute",
    top: 12,
    right: 12,
    color: "rgba(255,255,255,0.1)",
    fontSize: 10,
    fontWeight: "900",
  },
  featureIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featureTitle: { fontWeight: "900", marginBottom: 2 },
  featureSubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 7,
    fontWeight: "700",
  },

  // SECURITY
  securitySection: {
    borderRadius: 24,
    backgroundColor: "#0C0C1A",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.1)",
  },
  securityTitle: { color: "#fff", fontWeight: "900", marginBottom: 10 },
  securityDesc: {
    color: "rgba(255,255,255,0.4)",
    fontWeight: "700",
    letterSpacing: 1,
    lineHeight: 14,
    marginBottom: 25,
  },
  securityBtn: { borderRadius: 10, borderWidth: 1, alignItems: "center" },
  securityBtnText: { fontWeight: "900", letterSpacing: 1 },
});
