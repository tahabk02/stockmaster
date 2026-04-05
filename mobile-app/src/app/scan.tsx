import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAppTheme } from "../theme";
import {
  Scan,
  ShieldCheck,
  Zap,
  RotateCcw,
  Info,
  Focus,
  Maximize2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import api from "../api/client";

const { width, height } = Dimensions.get("window");

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();
  const theme = useAppTheme();
  const { colors, isDarkMode } = theme;

  // Cinematic Animation
  const scanLinePos = useSharedValue(0);
  const cornerOpacity = useSharedValue(0.5);

  useEffect(() => {
    scanLinePos.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
    cornerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.4, { duration: 500 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePos.value * 100}%`,
  }));

  const animatedCornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
  }));

  if (!permission)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          MISSION_CRITICAL: CAMERA_ACCESS_REQUIRED
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>GRANT_PROTOCOL_ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned || analyzing) return;
    setScanned(true);
    setAnalyzing(true);

    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // PRO_ANALYSIS: Search for SKU in registry
      const { data: response } = await api.get(`products/sku/${data}`);
      if (response.success) {
        router.push({
          pathname: "/details",
          params: { id: response.data._id },
        });
      } else {
        Alert.alert("ORACLE_SIGNAL", "ASSET_NOT_FOUND: INITIALIZE_NEW_ENTRY?", [
          { text: "ABORT", onPress: () => setScanned(false) },
          {
            text: "INITIALIZE",
            onPress: () =>
              router.push({
                pathname: "/details",
                params: { sku: data, mode: "create" },
              }),
          },
        ]);
      }
    } catch (e) {
      setScanned(false);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "code128"] }}
      />
      {/* CINEMATIC OVERLAY */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topHud}>
          <View style={styles.hudBadge}>
            <ShieldCheck size={14} color={colors.accent} />
            <Text style={styles.hudText}>NEURAL_LENS_ACTIVE</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <RotateCcw size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerContainer}>
          <Animated.View
            style={[styles.corner, styles.topLeft, animatedCornerStyle]}
          />
          <Animated.View
            style={[styles.corner, styles.topRight, animatedCornerStyle]}
          />
          <Animated.View
            style={[styles.corner, styles.bottomLeft, animatedCornerStyle]}
          />
          <Animated.View
            style={[styles.corner, styles.bottomRight, animatedCornerStyle]}
          />

          <View style={styles.scanTarget}>
            <Animated.View
              style={[
                styles.scanLine,
                { backgroundColor: colors.primary },
                animatedLineStyle,
              ]}
            />
          </View>
        </View>

        <View style={styles.bottomHud}>
          <View style={styles.instructionBox}>
            <Focus size={16} color="#fff" opacity={0.6} />
            <Text style={styles.instructionText}>
              ALIGN_ASSET_WITHIN_LATTICE
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>LATENCY</Text>
              <Text style={[styles.metricVal, { color: colors.accent }]}>
                12MS
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>CONFIDENCE</Text>
              <Text style={[styles.metricVal, { color: colors.primary }]}>
                99.4%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {analyzing && (
        <Animated.View entering={FadeIn} style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.analyzingText, { color: colors.primary }]}>
            DECRYPTING_ASSET_SIGNAL...
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 30,
    justifyContent: "space-between",
  },
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },
  hudBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  hudText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    fontStyle: "italic",
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  scannerContainer: {
    alignSelf: "center",
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#fff",
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  scanTarget: { width: "100%", height: "100%", overflow: "hidden" },
  scanLine: {
    width: "100%",
    height: 2,
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },

  bottomHud: { marginBottom: 40 },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 30,
  },
  instructionText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    opacity: 0.8,
  },

  metricsRow: { flexDirection: "row", justifyContent: "center", gap: 40 },
  metric: { alignItems: "center" },
  metricLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 8,
    fontWeight: "900",
    marginBottom: 4,
  },
  metricVal: { fontSize: 14, fontWeight: "900", fontStyle: "italic" },

  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    fontStyle: "italic",
  },

  text: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 12,
    fontWeight: "900",
  },
  button: { padding: 20, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "900", fontStyle: "italic" },
});
