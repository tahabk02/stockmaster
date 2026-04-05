import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { sqliteService } from "../services/sqlite.service";
import { useAppTheme } from "../theme";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import { X, Zap, Shield, Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export const ScanScreen = ({ navigation }: any) => {
  const { colors, typography } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, []);

  const onCodeScanned = async ({ data }: { data: string }) => {
    if (isActive) {
      setIsActive(false);
      if (Haptics.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate(100);
      }

      const barcode = data;
      const product = await sqliteService.getProductByBarcode(barcode);

      if (product) {
        await sqliteService.addToOfflineCart(product);
        navigation.navigate("ProductDetail", { product });
      } else {
        Alert.alert("SIGNAL_NOT_FOUND", "LE CODE À BARRES NE CORRESPOND À AUCUNE ENTRÉE DANS LE RÉGISTRE.");
      }

      setTimeout(() => setIsActive(true), 2000);
    }
  };

  if (!permission) return null;

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={isActive ? onCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "qr"],
        }}
      />

      {/* Cinematic Overlay */}
      <View style={styles.cinematicOverlay}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <GlassCard variant="transparent" intensity={40} style={styles.iconGlass}>
              <X size={20} color={colors.white} />
            </GlassCard>
          </TouchableOpacity>
          <GlassCard variant="transparent" intensity={20} style={styles.statusBadge}>
            <PulseIndicator color={colors.primary} size={6} />
            <Text style={[styles.statusText, typography.pro]}>AI_VISION_v2.0 // ACTIVE</Text>
          </GlassCard>
        </View>

        <View style={styles.scannerContainer}>
          <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
          
          <View style={styles.scanningLine} />
          
          <GlassCard variant="transparent" intensity={10} style={styles.windowGlass} />
        </View>

        <View style={styles.bottomBar}>
          <GlassCard variant="transparent" intensity={30} style={styles.instructionGlass}>
            <View style={styles.instructionRow}>
              <Search size={16} color={colors.primary} />
              <Text style={[styles.instructionText, typography.pro]}>ALIGNER_LE_SIGNAL_DANS_LE_CADRE</Text>
            </View>
          </GlassCard>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Shield size={12} color={colors.accent} />
              <Text style={[styles.metaText, typography.pro]}>SECURE_LINK</Text>
            </View>
            <View style={styles.metaItem}>
              <Zap size={12} color={colors.warning} />
              <Text style={[styles.metaText, typography.pro]}>FAST_SYNC</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cinematicOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 25,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  closeBtn: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  iconGlass: {
    padding: 12,
    borderRadius: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
  },
  scannerContainer: {
    width: width * 0.7,
    height: width * 0.7,
    alignSelf: 'center',
    position: 'relative',
  },
  windowGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
    zIndex: 10,
  },
  topLeft: {
    top: -5,
    left: -5,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 15,
  },
  topRight: {
    top: -5,
    right: -5,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 15,
  },
  bottomLeft: {
    bottom: -5,
    left: -5,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 15,
  },
  bottomRight: {
    bottom: -5,
    right: -5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 15,
  },
  scanningLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(99, 102, 241, 0.5)',
    zIndex: 5,
    shadowColor: '#6366f1',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  bottomBar: {
    marginBottom: 40,
    alignItems: 'center',
    gap: 20,
  },
  instructionGlass: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  metaText: {
    color: '#fff',
    fontSize: 8,
  },
});
