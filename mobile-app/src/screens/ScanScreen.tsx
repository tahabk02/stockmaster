import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { sqliteService } from "../services/sqlite.service";
import { theme } from "../theme";

export const ScanScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, []);

  const onCodeScanned = async ({ data }: { data: string }) => {
    if (isActive) {
      setIsActive(false); // وقف الكاميرا مؤقتاً
      Vibration.vibrate(100);

      const barcode = data;
      const product = await sqliteService.getProductByBarcode(barcode);

      if (product) {
        // إضافة للمنتج للسلة المحلية في SQLite
        await sqliteService.addToOfflineCart(product);
        navigation.navigate("ProductDetail", { product });
      } else {
        Alert.alert("Produit non reconnu", "Le code à barres ne correspond à aucun produit.");
      }

      setTimeout(() => setIsActive(true), 2000); // إعادة التفعيل بعد ثانيتين
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Initialisation de la caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Accès à la caméra refusé</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Demander l'autorisation</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

      {/* Overlay Design */}
      <View style={styles.overlay}>
        <View style={styles.scanWindow} />
        <Text style={styles.instructionText}>
          Scannez le code à barres
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  permissionButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 50,
    borderColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanWindow: {
    width: 256,
    height: 256,
    borderWidth: 2,
    borderColor: "#6366f1",
    borderRadius: 24,
  },
  instructionText: {
    color: "white",
    fontWeight: "bold",
    marginTop: 40,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: "absolute",
    top: 48,
    left: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
  },
  closeButtonText: {
    color: "white",
    fontWeight: '600',
  },
});
