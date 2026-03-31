import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { ScanScreen } from "../screens/ScanScreen";
import { OfflineSync } from "../screens/OfflineSync";
import { ProductDetail } from "../screens/ProductDetail"; // زدناها حيت كاينة فالتصويرة ديالك
import { Camera, RefreshCcw, Package } from "lucide-react-native";
import { theme } from "../theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// هادي كتجمع الـ Scan مع الـ Details ديال البرودوي
const ScanStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScanMain" component={ScanScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetail} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          margin: 20,
          borderRadius: 25,
          position: "absolute",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.slate[400],
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={OfflineSync}
        options={{
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
          tabBarLabel: "Stock",
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanStack} // استعملنا الـ Stack هنا باش نقدروا نفتحوا Detail
        options={{
          tabBarIcon: ({ color }) => (
            <Camera
              size={28}
              color={theme.colors.white}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 15,
                borderRadius: 20,
                marginTop: -30,
                shadowColor: theme.colors.primary,
                shadowOpacity: 0.4,
                shadowRadius: 10,
              }}
            />
          ),
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
        name="Sync"
        component={OfflineSync}
        options={{
          tabBarIcon: ({ color }) => <RefreshCcw size={24} color={color} />,
          tabBarLabel: "Sync",
        }}
      />
    </Tab.Navigator>
  );
};
