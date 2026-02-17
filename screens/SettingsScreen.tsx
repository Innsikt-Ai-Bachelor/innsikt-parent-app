import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { SphereBackground } from "@/components/ui/SphereBackground";

function Row({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-14 px-3 py-2 flex-row items-center justify-between"
    >
      <View>
        <Text className="text-text font-semibold">{title}</Text>
        {subtitle ? <Text className="text-muted text-xs mt-1">{subtitle}</Text> : null}
      </View>
      {right ? <Text className="text-primary font-bold">{right}</Text> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);

  const toggleTheme = async () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "sessions"]);
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      Alert.alert("Feil", "Klarte ikke å logge ut. Prøv igjen.");
    }
  };

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <SphereBackground />
      <View className="px-4 pt-1 flex-row items-center">
        <Pressable onPress={handleBack} hitSlop={12} className="w-8">
          <Text className="text-primary text-2xl font-extrabold">‹</Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-text font-extrabold">Settings</Text>
        </View>
        <View className="w-8" />
      </View>

      <View className="px-4">
        <Text className="text-text text-3xl font-extrabold text-center mt-2">Settings</Text>
        <Text className="text-muted text-center mt-2">Customize your experience</Text>

        <View className="mt-5 bg-card border border-border rounded-xl2 py-2">
          <Row
            title="Appearance"
            subtitle={isDark ? "Dark mode active" : "Light mode active"}
            right={isDark ? "Dark" : "Light"}
            onPress={toggleTheme}
          />
          <View className="h-px bg-border mx-3" />
          <Row
            title="Notifications"
            subtitle="Practice reminders"
            right={practiceReminders ? "On" : "Off"}
            onPress={() => setPracticeReminders((v) => !v)}
          />
          <View className="h-px bg-border mx-3" />
          <Row
            title="Progress Updates"
            subtitle="Weekly progress notifications"
            right={progressUpdates ? "On" : "Off"}
            onPress={() => setProgressUpdates((v) => !v)}
          />
          <View className="h-px bg-border mx-3" />
          <Row
            title="Language"
            subtitle="English"
            right="›"
            onPress={() => Alert.alert("Language", "Language settings coming soon.")}
          />
        </View>

        <Pressable
          className="mt-5 border border-orange-400/50 rounded-xl2 py-3 items-center"
          onPress={handleLogout}
        >
          <Text className="text-orange-300 font-extrabold">Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
