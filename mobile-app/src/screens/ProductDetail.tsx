import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Minus, Plus, ShoppingCart } from "lucide-react-native";
import { theme } from "../theme";
import { sqliteService } from "../services/sqlite.service";

export const ProductDetail = ({ route, navigation }: any) => {
  const { product } = route.params;
  const [qty, setQty] = useState(1);

  const handleConfirm = async () => {
    // حفظ الطلب محلياً في SQLite
    const order = {
      items: [{ ...product, cartQty: qty }],
      total: product.price * qty,
      method: "CASH",
    };
    await sqliteService.saveOfflineOrder(order);
    navigation.navigate("Sync"); // صيفطو لصفحة المزامنة
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
          />
        </View>
      </View>

      <Text style={styles.label}>
        Détails du Produit
      </Text>
      <Text style={styles.productName}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>
        {product.price.toFixed(2)} DH
      </Text>

      <View style={styles.qtyContainer}>
        <Text style={styles.qtyLabel}>
          Node Quantity
        </Text>
        <View style={styles.qtyControls}>
          <TouchableOpacity
            onPress={() => setQty(Math.max(1, qty - 1))}
            style={styles.qtyButton}
          >
            <Minus size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            onPress={() => setQty(qty + 1)}
            style={styles.qtyButton}
          >
            <Plus size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleConfirm}
        style={styles.addButton}
      >
        <ShoppingCart size={20} color="white" />
        <Text style={styles.addButtonText}>
          AJOUTER À LA COMMANDE
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 32,
    paddingTop: 64,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  imageWrapper: {
    width: 256,
    height: 256,
    backgroundColor: "#f8fafc",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  productName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 32,
  },
  qtyContainer: {
    backgroundColor: "#f8fafc",
    padding: 24,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  qtyLabel: {
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 12,
  },
  qtyText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1e293b",
    fontStyle: "italic",
  },
  addButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 24,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 18,
    marginLeft: 12,
  },
});
