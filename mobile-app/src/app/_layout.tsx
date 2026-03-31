import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, StyleSheet, View, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sqliteService } from "../../src/services/sqlite.service";
import { ShieldCheck } from "lucide-react-native";

import "../i18n";
import { useAuthStore } from "../store/auth.store";
import { useThemeStore } from "../store/theme.store";
import { useAppTheme } from "../theme";

import { useTranslation } from "react-i18next";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation();
  const { token, isInitialized, loadAuth } = useAuthStore();
  const { loadTheme } = useThemeStore();
  const theme = useAppTheme();
  const isAuthenticated = !!token;

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS !== "web") {
          await sqliteService.initDatabase();
        }
        await Promise.all([loadAuth(), loadTheme()]);
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "login";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, segments, isInitialized]);

  if (!isInitialized) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.secondary },
            headerTintColor: theme.colors.white,
            headerTitleStyle: { 
              fontWeight: "900", 
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: 1.5,
              fontStyle: "italic"
            },
            headerBackTitleVisible: false,
            headerShadowVisible: false,
            animation: "slide_from_right",
            headerRight: () => (
              <View style={{ marginRight: 10 }}>
                <ShieldCheck color={theme.colors.primary} size={18} />
              </View>
            )
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ title: t('DASHBOARD.TITLE'), headerShown: false }} />
          <Stack.Screen name="scan" options={{ title: t('DASHBOARD.SCAN') }} />
          <Stack.Screen name="inventory" options={{ title: t('INVENTORY.TITLE') }} />
          <Stack.Screen name="details" options={{ title: t('DETAILS.TITLE') }} />
          <Stack.Screen name="sync" options={{ title: t('SYNC.TITLE') }} />
          <Stack.Screen name="orders" options={{ headerShown: false }} />
          <Stack.Screen name="transfers" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="analytics" options={{ headerShown: false }} />
          <Stack.Screen name="suppliers" options={{ headerShown: false }} />
          <Stack.Screen name="clients" options={{ headerShown: false }} />
          <Stack.Screen name="order-details" options={{ title: t('DASHBOARD.ORDERS') }} />
          <Stack.Screen name="supplier-details" options={{ title: t('SUPPLIERS.TITLE') }} />
          <Stack.Screen name="client-details" options={{ title: t('CLIENTS.TITLE') }} />
          <Stack.Screen name="add-supplier" options={{ title: t('SUPPLIERS.PROVISION') }} />
          <Stack.Screen name="provision-supplier" options={{ title: t('DETAILS.UPDATE_STOCK') }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="logistics" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
