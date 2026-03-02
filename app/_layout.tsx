import "../global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("theme")
      .then((saved) => {
        if (saved === "light" || saved === "dark") {
          setColorScheme(saved);
        }
      })
      .catch(() => {})
      .finally(() => setThemeReady(true));
  }, [setColorScheme]);

  if (!themeReady) {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ header: () => null }} />
      <Stack.Screen name="login" options={{ header: () => null }} />
      <Stack.Screen name="chatbot" options={{ header: () => null }} />
      <Stack.Screen name="feedback" options={{ header: () => null }} />
      <Stack.Screen name="index" options={{ header: () => null }} />
    </Stack>
  );
}
